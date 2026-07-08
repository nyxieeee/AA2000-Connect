import { useState } from 'react';
import { 
  Cloud,
  X,
  Save,
  MessageCircle,
  ExternalLink,
  Key,
  Layout, 
  Globe,
  Building2,
  Bell,
  Palette,
  Camera,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Smartphone,
  Video
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/authStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'Profile' | 'Branding' | 'Integrations' | 'Notifications'>('Profile');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});

  const [branding, setBranding] = useState(() => JSON.parse(localStorage.getItem('settings_branding') || 'null') || {
    companyName: 'AA2000 Security & Technology Solutions Inc.',
    tagline: 'Leading Security & Automation Solutions in the Philippines',
    primaryColor: '#6366f1',
    secondaryColor: '#0f172a'
  });

  const [notifs, setNotifs] = useState(() => JSON.parse(localStorage.getItem('settings_notifications') || 'null') || {
    emailAlerts: true,
    browserPush: true,
    viberAlerts: false,
    hotLeadAlerts: true,
    dailyDigest: true
  });

  const integrations = [
    { id: 'viber', label: 'Viber API', desc: 'Connect your Viber bot for support.', icon: MessageCircle, color: 'text-purple-500', fields: ['Viber Auth Token'] },
    { id: 'whatsapp', label: 'WhatsApp Business', desc: 'Direct chat integration via Meta API.', icon: MessageSquare, color: 'text-emerald-600', fields: ['API Key', 'Phone Number ID'] },
    { id: 'tiktok', label: 'TikTok Lead Sync', desc: 'Auto-sync leads from TikTok Ads.', icon: Video, color: 'text-rose-600', fields: ['App ID', 'Secret Key'] },
    { id: 'sms', label: 'SMS Gateway', desc: 'Send automated text notifications.', icon: Smartphone, color: 'text-brand-blue', fields: ['API Key', 'Sender ID'] },
    { id: 'meta', label: 'Facebook & Instagram', desc: 'Sync inquiries from FB & IG.', icon: Layout, color: 'text-blue-600', fields: ['Page Access Token', 'App Secret'] },
    { id: 'website', label: 'Website Live Chat', desc: 'Install widget on your site.', icon: Globe, color: 'text-emerald-500', fields: ['Site API Key'] },
    { id: 'email', label: 'Email (SMTP/GHL)', desc: 'Setup professional email sending.', icon: Cloud, color: 'text-brand-blue', fields: ['SMTP Host', 'SMTP User', 'SMTP Password'] }
  ];

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const tabs = isAdmin 
    ? ['Profile', 'Branding', 'Integrations', 'Notifications'] 
    : ['Profile', 'Notifications'];

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title mb-1">Settings</h1>
          <p className="sub-title tracking-[0.2em]">Manage your profile, branding, and connected apps</p>
        </div>
        <button onClick={() => { localStorage.setItem('settings_branding', JSON.stringify(branding)); localStorage.setItem('settings_notifications', JSON.stringify(notifs)); alert('Settings saved successfully!'); }} className="premium-button flex items-center gap-2">
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-surface-border shadow-inner w-fit">
        {tabs.map(tab => (
          <button 
            key={tab}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-navy-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="glass-card flex flex-col items-center text-center space-y-4">
              <div className="relative">
                 <div className="w-32 h-32 rounded-full bg-navy-900 flex items-center justify-center text-white text-4xl font-semibold shadow-2xl border-4 border-white">
                    {user?.name?.[0] || 'A'}
                 </div>
                 <div className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg border-2 border-white">
                    <Camera size={16} />
                 </div>
              </div>
              <div>
                 <h2 className="text-xl font-semibold text-navy-900">{user?.name || 'Administrator'}</h2>
                 <p className="sub-title mt-1 mb-0 opacity-60">Employee ID: {user?.id || 'AA-2000-01'}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                 <CheckCircle2 size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Portal Verified Account</span>
              </div>
           </div>
           
           <div className="md:col-span-2 space-y-6">
              <div className="glass-card space-y-6">
                 <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-widest border-b border-slate-50 pb-4">Personal Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="sub-title">Email Address</label>
                       <input readOnly value={user?.email || 'admin@aa2000.com'} className="input-field opacity-60 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="sub-title">Department</label>
                       <input readOnly value="Executive Intelligence" className="input-field opacity-60 cursor-not-allowed" />
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed uppercase tracking-wider">
                       Note: Profile information is synced directly from the AA2000 Portal. To change these details, please visit the main Employee Portal settings.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Branding' && isAdmin && (
        <div className="max-w-4xl space-y-6">
           <div className="glass-card space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg shadow-brand-blue/20">
                    <Palette size={24} />
                 </div>
                 <div>
                    <h3 className="text-base font-semibold text-navy-900 uppercase tracking-widest">Company Branding</h3>
                    <p className="sub-title mb-0 opacity-60">Global aesthetic identity for AI Campaigns</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="sub-title">Enterprise Name</label>
                       <input 
                         type="text" 
                         value={branding.companyName}
                         onChange={e => setBranding({...branding, companyName: e.target.value})}
                         className="input-field"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="sub-title">Brand Tagline</label>
                       <textarea 
                         value={branding.tagline}
                         onChange={e => setBranding({...branding, tagline: e.target.value})}
                         className="input-field min-h-[100px] resize-none p-5 normal-case"
                       />
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="sub-title block">Logo Assets</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-brand-blue/30 hover:bg-brand-blue/[0.02] transition-all cursor-pointer group" onClick={() => document.getElementById('settings-logo-upload')?.click()}>
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-brand-blue transition-colors shadow-sm border border-slate-50">
                              <Building2 size={32} />
                           </div>
                           <div>
                              <p className="text-[10px] font-semibold text-navy-900 uppercase tracking-widest">Upload Official Logo</p>
                              <p className="sub-title mt-1 mb-0 opacity-60">PNG or SVG (Max 5MB)</p>
                           </div>
                           <input id="settings-logo-upload" type="file" accept="image/png,image/svg+xml" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; } alert(`Logo "${file.name}" selected for upload.`); } }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="sub-title">Primary Color</label>
                          <div className="flex items-center gap-2">
                             <input type="color" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none cursor-pointer" />
                             <span className="text-xs font-mono font-semibold text-slate-400 uppercase">{branding.primaryColor}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="sub-title">Accent Color</label>
                          <div className="flex items-center gap-2">
                             <input type="color" value={branding.secondaryColor} onChange={e => setBranding({...branding, secondaryColor: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none cursor-pointer" />
                             <span className="text-xs font-mono font-semibold text-slate-400 uppercase">{branding.secondaryColor}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Integrations' && isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div key={item.id} className="glass-card flex flex-col justify-between hover:border-brand-blue/30 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-4 rounded-2xl bg-slate-50 group-hover:bg-brand-blue/5 transition-colors shadow-sm", item.color)}>
                    <item.icon size={24} />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[8px] font-semibold uppercase tracking-widest border border-slate-200">Disconnected</span>
                </div>
                <h3 className="text-sm font-semibold text-navy-900 mb-1 uppercase tracking-widest">{item.label}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 uppercase tracking-wider">{item.desc}</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedIntegration(item); setIsKeyModalOpen(true); }}
                  className="flex-1 py-3 px-4 bg-brand-blue text-white rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-brand-light transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-blue/20"
                >
                  <Key size={14} />
                  <span>Configure</span>
                </button>
                <button className="p-3 border border-surface-border rounded-2xl text-slate-400 hover:text-navy-900 hover:bg-slate-50 transition-all">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="max-w-2xl space-y-6">
           <div className="glass-card space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                 <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
                    <Bell size={24} />
                 </div>
                 <div>
                    <h3 className="text-base font-semibold text-navy-900 uppercase tracking-widest">Alert Thresholds</h3>
                    <p className="sub-title mb-0 opacity-60">Configure real-time enterprise telemetry</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 {[
                   { key: 'emailAlerts', label: 'Email Notifications', desc: 'Summary of daily pipeline activity and leads.' },
                   { key: 'browserPush', label: 'Browser Push Alerts', desc: 'Instant desktop notifications for new messages.' },
                   { key: 'viberAlerts', label: 'Viber Broadcast Alerts', desc: 'Notify via Viber when an AI mission completes.' },
                   { key: 'hotLeadAlerts', label: 'Hot Lead Escalation', desc: 'Immediate alert when a contact hits score > 80.' },
                   { key: 'dailyDigest', label: 'AI Daily Digest', desc: 'Morning brief of high-priority sales tasks.' },
                 ].map(item => (
                   <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-brand-blue/20 transition-all cursor-pointer group">
                      <div className="space-y-1">
                         <p className="text-xs font-semibold text-navy-900 group-hover:text-brand-blue transition-colors uppercase tracking-widest">{item.label}</p>
                         <p className="sub-title mb-0 opacity-60">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => setNotifs({...notifs, [item.key]: !notifs[item.key as keyof typeof notifs]})}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          notifs[item.key as keyof typeof notifs] ? 'bg-brand-blue' : 'bg-slate-300'
                        )}
                      >
                         <span className={cn(
                           "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md",
                           notifs[item.key as keyof typeof notifs] ? 'translate-x-6' : 'translate-x-1'
                         )} />
                      </button>
                   </label>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Integration Modal */}
      {isKeyModalOpen && selectedIntegration && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in">
            <div className="px-10 py-8 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl bg-white shadow-lg", selectedIntegration.color)}>
                     <selectedIntegration.icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-widest">{selectedIntegration.label}</h2>
                    <p className="sub-title mb-0 opacity-60">Connect external telemetry</p>
                  </div>
               </div>
               <button onClick={() => setIsKeyModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-300 hover:text-navy-900 border border-transparent hover:border-slate-100">
                  <X size={24} />
               </button>
            </div>
            <div className="p-10 space-y-6">
                {selectedIntegration.fields.map((field: string) => (
                  <div key={field} className="space-y-2">
                    <label className="sub-title">{field}</label>
                    <input 
                      type="password" 
                      value={apiKeyValues[field] || ''}
                      onChange={e => setApiKeyValues({...apiKeyValues, [field]: e.target.value})}
                      placeholder={`Enter ${field}`}
                      className="input-field"
                    />
                  </div>
                ))}
                <div className="pt-6 flex gap-4">
                    <button onClick={() => setIsKeyModalOpen(false)} className="flex-1 py-4 bg-brand-blue/10 text-brand-blue rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-brand-blue/20 transition-all border border-brand-blue/20">Cancel</button>
                    <button onClick={() => { const key = `settings_api_${selectedIntegration.id}`; const existing = JSON.parse(localStorage.getItem(key) || '{}'); localStorage.setItem(key, JSON.stringify({ ...existing, ...apiKeyValues })); setApiKeyValues({}); setIsKeyModalOpen(false); alert(`${selectedIntegration.label} authorized successfully!`); }} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-semibold uppercase tracking-widest text-[10px] hover:bg-brand-light transition-all shadow-xl shadow-brand-blue/20">Authorize</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SettingsPage;
