import { useState } from 'react';
import { Shield, Users, Palette, Key, Globe, MessageCircle, MessageSquare, Smartphone, Video, Layout, Cloud, Save, Search, Trash2, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/authStore';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { storage } from '../../services/storage';

const initialUsers = [
  { id: '1', name: 'Authorized User', email: 'user@aa2000.ph', role: 'admin', department: 'Management' },
  { id: '2', name: 'Anna Santos', email: 'anna@aa2000.ph', role: 'sales_manager', department: 'Sales' },
  { id: '3', name: 'Ben Reyes', email: 'ben@aa2000.ph', role: 'sales_rep', department: 'Sales' },
  { id: '4', name: 'Carla Dimagiba', email: 'carla@aa2000.ph', role: 'sales_rep', department: 'Sales' },
  { id: '5', name: 'Dennis Lee', email: 'dennis@aa2000.ph', role: 'sales_rep', department: 'Sales' },
];

const roleColors: Record<string, string> = {
  admin: 'text-purple-600 bg-purple-50',
  sales_manager: 'text-blue-600 bg-blue-50',
  sales_rep: 'text-slate-600 bg-slate-100',
};

export default function AdminPanelPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'branding' | 'integrations'>('users');
  const [users, setUsers] = useState<typeof initialUsers>(() => storage.get<typeof initialUsers>('admin_users') || initialUsers);
  const [branding, setBranding] = useState<{
    companyName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
  }>(() => storage.get<{
    companyName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
  }>('admin_branding') || {
    companyName: 'AA2000 Security & Technology Solutions Inc.',
    tagline: 'Leading Security & Automation Solutions in the Philippines',
    primaryColor: '#6366f1',
    secondaryColor: '#0f172a',
  });

  const persistUsers = (updated: typeof initialUsers) => { setUsers(updated); storage.set('admin_users', updated); };
  const persistBranding = (updated: typeof branding) => { setBranding(updated); storage.set('admin_branding', updated); };

  const integrations = [
    { id: 'gemini', label: 'Gemini AI API', desc: 'Powers Google Search grounding and AI chat.', icon: Shield, color: 'text-violet-600', envVar: 'VITE_GEMINI_API_KEY', isConfigured: !!import.meta.env.VITE_GEMINI_API_KEY },
    { id: 'groq', label: 'Groq Cloud API', desc: 'Powers high-speed Llama, GPT OSS, & Qwen agents.', icon: Shield, color: 'text-orange-500', envVar: 'VITE_GROQ_API_KEY', isConfigured: !!import.meta.env.VITE_GROQ_API_KEY },
    { id: 'mistral', label: 'Mistral Developer API', desc: 'Powers open-source Mistral Nemo agent logic.', icon: Shield, color: 'text-red-500', envVar: 'VITE_MISTRAL_API_KEY', isConfigured: !!import.meta.env.VITE_MISTRAL_API_KEY },
    { id: 'viber', label: 'Viber API', desc: 'Connect your Viber bot for support.', icon: MessageCircle, color: 'text-purple-500', envVar: 'VITE_VIBER_TOKEN', isConfigured: !!import.meta.env.VITE_VIBER_TOKEN },
    { id: 'whatsapp', label: 'WhatsApp Business', desc: 'Direct chat integration via Meta API.', icon: MessageSquare, color: 'text-emerald-600', envVar: 'VITE_WHATSAPP_TOKEN', isConfigured: !!import.meta.env.VITE_WHATSAPP_TOKEN },
    { id: 'tiktok', label: 'TikTok Lead Sync', desc: 'Auto-sync leads from TikTok Ads.', icon: Video, color: 'text-rose-600', envVar: 'VITE_TIKTOK_SECRET', isConfigured: !!import.meta.env.VITE_TIKTOK_SECRET },
    { id: 'sms', label: 'SMS Gateway', desc: 'Send automated text notifications.', icon: Smartphone, color: 'text-brand-blue', envVar: 'VITE_SMS_GATEWAY_KEY', isConfigured: !!import.meta.env.VITE_SMS_GATEWAY_KEY },
    { id: 'meta', label: 'Facebook & Instagram', desc: 'Sync inquiries from FB & IG.', icon: Layout, color: 'text-blue-600', envVar: 'VITE_META_ACCESS_TOKEN', isConfigured: !!import.meta.env.VITE_META_ACCESS_TOKEN },
    { id: 'website', label: 'Website Live Chat', desc: 'Install widget on your site.', icon: Globe, color: 'text-emerald-500', envVar: 'VITE_WEBSITE_API_KEY', isConfigured: !!import.meta.env.VITE_WEBSITE_API_KEY },
    { id: 'email', label: 'Email (SMTP/GHL)', desc: 'Setup professional email sending.', icon: Cloud, color: 'text-brand-blue', envVar: 'VITE_SMTP_PASSWORD', isConfigured: !!import.meta.env.VITE_SMTP_PASSWORD },
  ];

  const [showUserForm, setShowUserForm] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'sales_rep', department: 'Sales' });

  const addUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const updated = [...users, { ...newUser, id: `user-${Date.now()}` }];
    persistUsers(updated);
    setNewUser({ name: '', email: '', role: 'sales_rep', department: 'Sales' });
    setShowUserForm(false);
  };

  const deleteUser = (id: string) => persistUsers(users.filter(u => u.id !== id));
  const updateUserRole = (id: string, role: string) => persistUsers(users.map(u => u.id === id ? { ...u, role } : u));

  const filteredUsers = users.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50"><Shield size={20} className="text-purple-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Admin Panel</h1>
              <p className="text-xs text-slate-500 mt-0.5">System configuration, user management, and integrations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 w-fit">
        <Shield size={14} className="text-purple-600" />
        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">Logged in as Admin · {user?.email}</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-surface-border shadow-inner w-fit">
        {[
          { key: 'users', label: 'User Management', icon: Users },
          { key: 'branding', label: 'Branding', icon: Palette },
          { key: 'integrations', label: 'Integrations', icon: Key },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as 'users' | 'branding' | 'integrations')}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === tab.key ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-navy-900"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* === User Management === */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 border border-surface-border rounded-xl text-sm outline-none" />
            </div>
            <button onClick={() => setShowUserForm(true)} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
              <Plus size={16} /> Add User
            </button>
          </div>

          {showUserForm && (
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
                <input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
                  <option value="admin">Admin</option><option value="sales_manager">Sales Manager</option><option value="sales_rep">Sales Rep</option>
                </select>
                <select value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} className="px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none">
                  <option value="Sales">Sales</option><option value="Marketing">Marketing</option><option value="Management">Management</option><option value="Operations">Operations</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addUser} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue rounded-lg">Add User</button>
                <button onClick={() => setShowUserForm(false)} className="px-3 py-2 text-xs font-semibold text-slate-500">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold">{u.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-navy-900">{u.name}</p>
                    <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', roleColors[u.role])}>{u.role.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-500">{u.email} · {u.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} className="px-2 py-1 text-[10px] bg-slate-50 border border-surface-border rounded-lg outline-none">
                    <option value="admin">Admin</option><option value="sales_manager">Sales Manager</option><option value="sales_rep">Sales Rep</option>
                  </select>
                  <button onClick={() => deleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === Branding === */}
      {activeTab === 'branding' && (
        <div className="max-w-4xl space-y-6">
          <div className="glass-card space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg shadow-brand-blue/20"><Palette size={24} /></div>
              <div>
                <h3 className="text-base font-semibold text-navy-900 uppercase tracking-widest">Company Branding</h3>
                <p className="text-xs text-slate-400">Global aesthetic identity for AI Campaigns</p>
              </div>
              <button onClick={() => { persistBranding(branding); alert('Branding saved successfully!'); }} className="ml-auto premium-button flex items-center gap-2 text-xs"><Save size={14} /> Save Changes</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Name</label>
                  <input type="text" value={branding.companyName} onChange={e => persistBranding({...branding, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Tagline</label>
                  <textarea value={branding.tagline} onChange={e => persistBranding({...branding, tagline: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none min-h-[80px] resize-none" />
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Logo Assets</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-brand-blue/30 cursor-pointer group" onClick={() => document.getElementById('admin-logo-upload')?.click()}>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-brand-blue transition-colors shadow-sm border border-slate-50">
                      <Palette size={32} />
                    </div>
                    <p className="text-[10px] font-semibold text-navy-900 uppercase tracking-widest">Upload Official Logo</p>
                    <p className="text-[10px] text-slate-400">PNG or SVG (Max 5MB)</p>
                    <input id="admin-logo-upload" type="file" accept="image/png,image/svg+xml" className="hidden" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={branding.primaryColor} onChange={e => persistBranding({...branding, primaryColor: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none cursor-pointer" />
                      <span className="text-xs font-mono font-semibold text-slate-400 uppercase">{branding.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={branding.secondaryColor} onChange={e => persistBranding({...branding, secondaryColor: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none cursor-pointer" />
                      <span className="text-xs font-mono font-semibold text-slate-400 uppercase">{branding.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Integrations === */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div key={item.id} className="glass-card flex flex-col justify-between hover:border-brand-blue/30 group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-4 rounded-2xl bg-slate-50 group-hover:bg-brand-blue/5 transition-colors shadow-sm", item.color)}>
                    <item.icon size={24} />
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border", 
                    item.isConfigured 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  )}>
                    {item.isConfigured ? 'Active' : 'Unconfigured'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-navy-900 mb-1 uppercase tracking-widest">{item.label}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Key: {item.envVar}</span>
                <span className="font-semibold text-navy-900 uppercase text-[8px]">🔐 IT Configured</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
