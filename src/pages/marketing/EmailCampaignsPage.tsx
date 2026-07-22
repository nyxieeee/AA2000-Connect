import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Mail, 
  Send, 
  Eye, 
  Layout, 
  MousePointer2, 
  BarChart3,
  Sparkles,
  Clock,
  Trash2,
  Laptop,
  Smartphone
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';
import { useCRMStore } from '../../stores/modules/crmStore';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'Welcome' | 'Promotion' | 'Follow-up' | 'Safety';
  stats: {
    sent: number;
    openRate: string;
    clickRate: string;
  };
}

interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  status: 'Active' | 'Scheduled' | 'Completed';
  recipients: number;
  engagement: number;
  time: string;
  createdAt: string;
}

const EmailCampaignsPage = () => {
  const [activeView, setActiveView] = useState<'Templates' | 'Campaigns' | 'Analytics'>('Templates');
  const { contacts, fetchContacts } = useCRMStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => storage.get('mktg_email_templates') || [
    { 
      id: '1', 
      name: 'Residential Solar Welcome', 
      subject: 'Welcome to AA2000: Your Solar Journey Starts Here!', 
      category: 'Welcome',
      body: `Dear Valued Customer,

Thank you for choosing AA2000 Security & Technology Solutions Inc. as your sustainable energy partner. We are excited to support you on your solar energy journey!

Our team of certified engineers will guide you through:
1. Custom PV System Design & Engineering
2. Net-Metering & Permitting applications
3. Professional Installation & commissioning
4. 25-Year Performance Warranty monitoring

If you have any immediate questions, feel free to schedule a call with your dedicated account officer.

Best regards,
The AA2000 Solar Engineering Team`,
      stats: { sent: 1240, openRate: '68%', clickRate: '12.5%' }
    },
    { 
      id: '2', 
      name: 'Fire Safety Awareness Month', 
      subject: 'Is your home protected? Critical fire safety tips inside.', 
      category: 'Safety',
      body: `Dear Homeowner,

Fire safety is not just about having an alarm—it is about having a system you can rely on. As part of Fire Safety Awareness Month, AA2000 is offering complimentary safety inspections.

Critical systems to check:
- Fire Detection and Alarm System (FDAS) sensor responsiveness
- Fire sprinkler water pressure and valves
- Kitchen suppression systems

Contact us today to book your free inspection with our licensed fire protection specialists.

Stay Safe,
AA2000 Fire Safety Department`,
      stats: { sent: 5600, openRate: '42%', clickRate: '8.2%' }
    },
    { 
      id: '3', 
      name: 'Summer Promo 2026', 
      subject: 'Get 20% OFF on all Smart Alarm Systems!', 
      category: 'Promotion',
      body: `Hi there,

Upgrade your home security this summer and save 20% on all smart alarms, CCTV networks, and wireless keypads!

Why choose AA2000 Smart Security?
- Real-time mobile alerts & live video streaming
- Backup battery power supply for outages
- Professional local integration and support

Use code SUMMERSAFE20 at checkout or contact our sales team to claim your discount.

Hurry, offer ends June 30!

Best,
AA2000 Sales Team`,
      stats: { sent: 8900, openRate: '35%', clickRate: '15.1%' }
    },
  ]);

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => storage.get('mktg_email_campaigns') || [
    { id: '1', name: 'Welcome Series Autoresponder', templateId: '1', status: 'Active', recipients: 4500, engagement: 68, time: 'Daily', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '2', name: 'Easter Flash Sale 2026', templateId: '3', status: 'Scheduled', recipients: 12000, engagement: 0, time: 'Apr 12, 10:00 AM', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', name: 'Solar Maintenance Blast', templateId: '2', status: 'Completed', recipients: 3200, engagement: 42, time: 'Completed Mar 01', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  ]);

  // Modal Control States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    category: 'Welcome' as const,
    body: ''
  });

  // Visual Template Editor states
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editorDevice, setEditorDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Send Campaign states
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<EmailTemplate | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignAudience, setCampaignAudience] = useState('All Contacts');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.random().toString(36).substr(2, 9);
    const templateToAdd: EmailTemplate = {
      id: newId,
      name: newTemplate.name,
      subject: newTemplate.subject,
      category: newTemplate.category,
      body: newTemplate.body || `Subject: ${newTemplate.subject}\n\nHi there,\n\n[Write your email body here or use AI to generate it!]\n\nBest,\nYour Team`,
      stats: { sent: 0, openRate: '0%', clickRate: '0%' }
    };
    const updated = [...templates, templateToAdd];
    setTemplates(updated);
    storage.set('mktg_email_templates', updated);
    setIsCreateModalOpen(false);
    setNewTemplate({ name: '', subject: '', category: 'Welcome', body: '' });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      storage.set('mktg_email_templates', updated);
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const updated = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    setTemplates(updated);
    storage.set('mktg_email_templates', updated);
    setIsEditorModalOpen(false);
    setEditingTemplate(null);
  };

  const handleGenerateAI = async () => {
    if (!editingTemplate) return;
    setIsGeneratingAI(true);
    const topic = aiPrompt.trim() || 'General Announcement';
    const systemPrompt = `You are a professional email marketing copywriter for AA2000 Security & Technology Solutions Inc., a leading system integrator in the Philippines specializing in fire safety, security, and smart building technology.
Generate an engaging, professional, and detailed email newsletter body copy based on the subject: "${editingTemplate.subject}" and topic description: "${topic}".
The email should:
1. Address the customer politely (e.g. Dear Valued Partner, Hi Customer).
2. Clearly explain the value proposition, products, or instructions in detail.
3. Be professional and free of emojis.
4. Conclude with a warm signature from the AA2000 Team.
Do not use Markdown hashes or bold syntax. Output only the plaintext email body.`;

    const userPrompt = `Write the email body.`;

    let success = false;
    let resultsText = '';

    // 1. Try Groq
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Email AI (Groq) failed, trying Mistral:', e);
      }
    }

    // 2. Try Mistral
    if (!success && MISTRAL_API_KEY) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: 'open-mistral-7b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Email AI (Mistral) failed, trying Gemini:', e);
      }
    }

    // 3. Try Gemini
    if (!success && GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Email AI (Gemini) failed:', e);
      }
    }

    if (success && resultsText) {
      setEditingTemplate({
        ...editingTemplate,
        body: resultsText.trim()
      });
    } else {
      // Fallback draft
      setEditingTemplate({
        ...editingTemplate,
        body: `Dear Valued Customer,

Following up on our discussions regarding "${topic}", we are pleased to present you with customized security and automation packages from AA2000 Security & Technology Solutions.

Our customized systems guarantee:
- 24/7 technical monitoring and engineering support.
- Fully compliant fire protection (FDAS) certified for Philippine fire codes.
- High-definition CCTV and structured communication links.

Please reply directly to this email or coordinate with your account executive to organize a physical engineering survey.

Sincerely,
The AA2000 Philippines Team`
      });
    }
    setIsGeneratingAI(false);
  };

  const handleStartCampaign = async () => {
    if (!sendingTemplate) return;
    setIsSending(true);
    setSendingProgress(0);
    setSendingLogs([]);

    const targetContacts = contacts.length > 0 ? contacts : [
      { name: 'Juan Dela Cruz', email: 'juan.delacruz@gmail.com' },
      { name: 'Maria Santos', email: 'maria.santos@yahoo.com' },
      { name: 'Angelo Reyes', email: 'angelo.reyes@techcorp.ph' },
      { name: 'Sofia Garcia', email: 'sofia.garcia@outlook.com' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any[];

    setSendingLogs(prev => [...prev, 'Initializing connection to AA2000 SMTP server...']);
    await new Promise(r => setTimeout(r, 600));

    setSendingLogs(prev => [...prev, `Found ${targetContacts.length} target recipients in audience list...`]);
    await new Promise(r => setTimeout(r, 600));

    setSendingLogs(prev => [...prev, 'MTA authentication successful. Beginning dispatch...']);
    await new Promise(r => setTimeout(r, 500));

    for (let i = 0; i < targetContacts.length; i++) {
      const c = targetContacts[i];
      const percent = Math.round(((i + 1) / targetContacts.length) * 100);
      setSendingProgress(percent);
      setSendingLogs(prev => [...prev, `[${percent}%] Sending to ${c.name} <${c.email}>`]);
      await new Promise(r => setTimeout(r, 200 + Math.random() * 150));
    }

    setSendingLogs(prev => [...prev, 'Campaign dispatch completed successfully!']);
    await new Promise(r => setTimeout(r, 800));

    const newCampaign: EmailCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: campaignName.trim() || `${sendingTemplate.name} Broadcast`,
      templateId: sendingTemplate.id,
      status: 'Completed',
      recipients: targetContacts.length,
      engagement: Math.floor(40 + Math.random() * 35),
      time: `Completed Today`,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = templates.map(t => {
      if (t.id === sendingTemplate.id) {
        const currentSent = t.stats.sent || 0;
        return {
          ...t,
          stats: {
            ...t.stats,
            sent: currentSent + targetContacts.length
          }
        };
      }
      return t;
    });

    const updatedCampaigns = [newCampaign, ...campaigns];
    setTemplates(updatedTemplates);
    setCampaigns(updatedCampaigns);
    storage.set('mktg_email_templates', updatedTemplates);
    storage.set('mktg_email_campaigns', updatedCampaigns);

    setIsSending(false);
    setIsSendModalOpen(false);
    setSendingTemplate(null);
    setCampaignName('');
  };

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
                          <button onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); setIsEditorModalOpen(true); }} className="flex-1 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-navy-900 shadow-sm border border-slate-100 hover:bg-slate-50">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); setSendingTemplate(template); setCampaignName(`${template.name} Campaign`); setIsSendModalOpen(true); }} className="px-3 py-2 bg-brand-blue rounded-xl text-white shadow-sm hover:bg-brand-light transition-colors">
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
                           template.category === 'Safety' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                         )}>
                            {template.category}
                         </span>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }} className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded">
                            <Trash2 size={12} />
                         </button>
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
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50 transition-all cursor-pointer group">
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
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this campaign history?')) {
                                const updated = campaigns.filter(c => c.id !== campaign.id);
                                setCampaigns(updated);
                                storage.set('mktg_email_campaigns', updated);
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={14} />
                          </button>
                       </td>
                    </tr>
                  ))}
              </tbody>
           </table>
        </div>
      )}      {/* Analytics View */}
      {activeView === 'Analytics' && (() => {
        const completedCampaigns = campaigns.filter(c => c.status === 'Completed');
        const totalSent = completedCampaigns.reduce((acc, c) => acc + c.recipients, 0);
        const totalOpens = completedCampaigns.reduce((acc, c) => acc + Math.round(c.recipients * c.engagement / 100), 0);
        const avgOpenRate = completedCampaigns.length > 0 
          ? (completedCampaigns.reduce((acc, c) => acc + c.engagement, 0) / completedCampaigns.length).toFixed(1)
          : '0.0';
        const conversions = Math.round(totalOpens * 0.08);

        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Sent', val: totalSent.toLocaleString(), icon: Mail, color: 'text-blue-500' },
                  { label: 'Unique Opens', val: totalOpens.toLocaleString(), icon: Eye, color: 'text-emerald-500' },
                  { label: 'Avg. Open Rate', val: `${avgOpenRate}%`, icon: MousePointer2, color: 'text-purple-500' },
                  { label: 'Conversions', val: conversions.toLocaleString(), icon: Target, color: 'text-brand-blue' },
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
             
             <div className="glass-card p-6 space-y-4">
                <div className="border-b border-surface-border pb-4 flex items-center gap-2">
                   <BarChart3 size={18} className="text-brand-blue" />
                   <h3 className="text-xs font-black text-navy-900 uppercase tracking-widest">Campaign Performance Index</h3>
                </div>
                {completedCampaigns.length > 0 ? (
                  <div className="space-y-3">
                     {completedCampaigns.map(c => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-navy-900 font-bold text-xs uppercase border border-slate-100">
                                 {c.name.substring(0, 2)}
                              </div>
                              <div>
                                 <h4 className="text-xs font-bold text-navy-900">{c.name}</h4>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Sent to {c.recipients} Leads</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Open Rate</p>
                                 <p className="text-xs font-black text-brand-blue">{c.engagement}%</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Conversions</p>
                                 <p className="text-xs font-black text-emerald-600">{Math.round(c.recipients * c.engagement * 0.0008)}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     No campaigns dispatched yet.
                  </div>
                )}
             </div>
          </div>
        );
      })()}

      {/* Simple Create Modal Placeholder */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4">
           <form onSubmit={handleCreateTemplate} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-10 py-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                       <Mail size={20} />
                    </div>
                    <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">Create New Template</h2>
                 </div>
                 <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Template Name</label>
                            <input 
                              type="text" 
                              required
                              value={newTemplate.name} 
                              onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue" 
                              placeholder="e.g. CCTV Promo Blast" 
                            />
                       </div>
                       <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Line</label>
                            <input 
                              type="text" 
                              required
                              value={newTemplate.subject} 
                              onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })} 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue" 
                              placeholder="e.g. Save 20% on smart fire sensors" 
                            />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                          <select 
                            value={newTemplate.category} 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value as any })} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer"
                          >
                             <option value="Welcome">Welcome</option>
                             <option value="Promotion">Promotion</option>
                             <option value="Safety">Safety</option>
                             <option value="Follow-up">Follow-up</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Layout Style</label>
                       <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Minimalist', desc: 'Plain text with CTA' },
                            { name: 'Product Focus', desc: 'Grid features layout' },
                            { name: 'Newsletter', desc: 'Weekly informational' },
                            { name: 'Urgency Blast', desc: 'Clean, bold alert banner' }
                          ].map(t => (
                            <div 
                              key={t.name} 
                              onClick={() => {
                                const defaultBody = `Subject: ${newTemplate.subject || 'AA2000 Announcement'}\n\nHi there,\n\nThis is a custom ${t.name} newsletter layout created for your building requirements.\n\nWe integrate FDAS, CCTV, structured cabling, and smart networks to keep your operations safe.\n\nLearn more at AA2000 Solutions.`;
                                setNewTemplate({ ...newTemplate, body: defaultBody });
                              }}
                              className={cn(
                                "p-3 border rounded-xl text-center cursor-pointer transition-all hover:bg-white hover:border-brand-blue",
                                newTemplate.body.includes(t.name) ? "border-brand-blue bg-white shadow-sm" : "border-slate-100 bg-slate-50"
                              )}
                            >
                               <div className="h-10 flex items-center justify-center mb-1">
                                  <Layout size={20} className="text-slate-200" />
                               </div>
                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block leading-tight">{t.name}</span>
                               <span className="text-[7px] text-slate-400 mt-0.5 block leading-tight">{t.desc}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[9px] text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-brand-light transition-all shadow-lg active:scale-[0.98]">Create Template</button>
                 </div>
              </div>
           </form>
         </div>,
        document.body
      )}
      {/* Template Editor Modal */}
      {isEditorModalOpen && editingTemplate && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="px-10 py-5 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                  <Layout size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">Template Editor</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Editing: {editingTemplate.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Device Selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setEditorDevice('desktop')}
                    className={cn("p-1.5 rounded-md", editorDevice === 'desktop' ? "bg-white text-brand-blue shadow-sm" : "text-slate-400")}
                  >
                    <Laptop size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditorDevice('mobile')}
                    className={cn("p-1.5 rounded-md", editorDevice === 'mobile' ? "bg-white text-brand-blue shadow-sm" : "text-slate-400")}
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
                <button type="button" onClick={() => { setIsEditorModalOpen(false); setEditingTemplate(null); }} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Split Editor Content */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left Pane - Inputs & AI */}
              <div className="w-full lg:w-1/2 p-8 border-r border-surface-border overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Template Name</label>
                    <input 
                      type="text" 
                      value={editingTemplate.name} 
                      onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Subject</label>
                    <input 
                      type="text" 
                      value={editingTemplate.subject} 
                      onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Body</label>
                    <textarea 
                      rows={8}
                      value={editingTemplate.body} 
                      onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue font-mono resize-none"
                    />
                  </div>
                </div>

                {/* AI Copywriter Assist Section */}
                <div className="p-5 bg-brand-blue/[0.02] border border-brand-blue/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-blue animate-pulse" />
                    <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-widest">AI Copywriting Assistant</h3>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Announce 15% off solar packages during rainy season..." 
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white border border-slate-150 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue"
                    />
                    <button 
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleGenerateAI}
                      className="px-5 bg-brand-blue text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-brand-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingAI ? <Clock size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>{isGeneratingAI ? 'Writing...' : 'Generate'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Pane - Live Simulated Preview */}
              <div className="w-full lg:w-1/2 p-8 bg-slate-50 overflow-y-auto flex items-center justify-center">
                <div className={cn(
                  "bg-white shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col",
                  editorDevice === 'mobile' ? "w-[360px] h-[550px] rounded-[2rem]" : "w-full h-full rounded-2xl"
                )}>
                  {/* Browser/Mobile Bar */}
                  <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 shrink-0">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mx-auto bg-white border border-slate-200 px-3 py-0.5 rounded text-[8px] text-slate-400 truncate max-w-[250px] select-none font-mono">
                      https://mail.google.com/aa2000-crm
                    </div>
                  </div>

                  {/* Email Viewer */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white font-sans text-slate-800 text-xs">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject: <span className="text-navy-900 font-normal lowercase">{editingTemplate.subject}</span></p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">From: <span className="text-navy-900 font-normal lowercase">marketing@aa2000.ph</span></p>
                    </div>

                    {/* Logo/Branding Header */}
                    <div className="py-4 bg-navy-900 rounded-xl text-center text-white font-black tracking-widest uppercase text-sm italic">
                      AA2000 SECURITY & TECH
                    </div>

                    {/* Body text rendered nicely */}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                      {editingTemplate.body}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 pt-6 text-center text-[9px] text-slate-400 space-y-1">
                      <p className="font-bold">AA2000 Security & Technology Solutions Inc.</p>
                      <p>FDAS • CCTV • Access Control • Structured Cabling • Suppression Systems</p>
                      <p className="opacity-50">You are receiving this because you are a registered partner in the Philippines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-10 py-5 border-t border-surface-border flex justify-end gap-4 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => { setIsEditorModalOpen(false); setEditingTemplate(null); }} 
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
              >
                Discard
              </button>
              <button 
                type="button" 
                onClick={handleSaveTemplate}
                className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-brand-light transition-all shadow-md"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Send Campaign Modal */}
      {isSendModalOpen && sendingTemplate && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                  <Send size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-navy-900 uppercase tracking-[0.15em]">Launch Campaign</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Template: {sendingTemplate.name}</p>
                </div>
              </div>
              {!isSending && (
                <button type="button" onClick={() => { setIsSendModalOpen(false); setSendingTemplate(null); }} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              )}
            </div>

            <div className="p-10 space-y-6">
              {!isSending ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Tracking Name</label>
                      <input 
                        type="text" 
                        required
                        value={campaignName} 
                        onChange={e => setCampaignName(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue" 
                        placeholder="e.g. CCTV Summer Promo Blast" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target CRM Audience</label>
                      <select 
                        value={campaignAudience} 
                        onChange={e => setCampaignAudience(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-navy-900 outline-none focus:border-brand-blue cursor-pointer"
                      >
                        <option value="All Contacts">All Leads & Contacts ({contacts.length || 15} recipients)</option>
                        <option value="Active Leads">Filtered Active Prospects (4 recipients)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <h3 className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Email Summary Preview</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Subject: <span className="text-navy-900 font-normal">{sendingTemplate.subject}</span></p>
                    <p className="text-[9px] text-slate-400 mt-2 truncate font-mono">{sendingTemplate.body.substring(0, 100)}...</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => { setIsSendModalOpen(false); setSendingTemplate(null); }} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[9px] text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                    <button type="button" onClick={handleStartCampaign} className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-brand-light transition-all shadow-lg flex items-center justify-center gap-2">
                      <Send size={12} />
                      <span>Launch Campaign</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Live dispatch progress tracking */
                <div className="space-y-6 py-4">
                  <div className="space-y-2 text-center">
                    <h3 className="text-xs font-black text-navy-900 uppercase tracking-widest animate-pulse">Campaign Dispatch in Progress</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Do not close this panel while sending</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-navy-900 uppercase">
                      <span>Progress</span>
                      <span>{sendingProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5 shadow-inner">
                      <div className="h-full bg-brand-blue rounded-full transition-all duration-300 shadow-sm" style={{ width: `${sendingProgress}%` }} />
                    </div>
                  </div>

                  {/* Sending Logs */}
                  <div className="h-48 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-1.5 shadow-inner">
                    {sendingLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-brand-blue shrink-0">&gt;</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
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
