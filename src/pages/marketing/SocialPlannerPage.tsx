import { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Video,
  MessageCircle,
  Globe,
  Layout as Facebook,
  Image as Instagram,
  Upload,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer2,
  Image as ImageIcon,
  FileVideo
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

interface ScheduledPost {
  id: string;
  day: number;
  platform: 'Facebook' | 'Instagram' | 'Viber' | 'TikTok' | 'Website';
  title: string;
  color: string;
  mediaType?: 'image' | 'video';
  mediaName?: string;
  analytics?: {
    reach: number;
    engagement: number;
    clicks: number;
  };
}

const SocialPlannerPage = () => {
  const [activeTab, setActiveTab] = useState('Calendar');
  const [posts, setPosts] = useState<ScheduledPost[]>([
    { 
      id: '1', 
      day: 10, 
      platform: 'Facebook', 
      title: 'Fire Safety Tips 2026', 
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      mediaType: 'image',
      mediaName: 'safety_banner.jpg',
      analytics: { reach: 1240, engagement: 89, clicks: 34 }
    },
    { 
      id: '2', 
      day: 12, 
      platform: 'Viber', 
      title: 'New Product Arrival: Smart Alarms', 
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      analytics: { reach: 850, engagement: 142, clicks: 67 }
    },
    { 
      id: '3', 
      day: 5, 
      platform: 'TikTok', 
      title: 'Installation Walkthrough', 
      color: 'bg-pink-50 text-pink-700 border-pink-100',
      mediaType: 'video',
      mediaName: 'install_demo.mp4',
      analytics: { reach: 5600, engagement: 412, clicks: 89 }
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({ 
    day: new Date().getDate(), 
    title: '', 
    platform: 'Facebook',
  });
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video', name: string} | null>(null);
  const [aiTopic, setAiTopic] = useState('');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    let color = 'bg-slate-50 text-slate-700 border-slate-100';
    if (newPost.platform === 'Facebook') color = 'bg-blue-50 text-blue-700 border-blue-100';
    if (newPost.platform === 'Instagram') color = 'bg-gradient-to-br from-purple-50 to-pink-50 text-pink-700 border-pink-100';
    if (newPost.platform === 'Viber') color = 'bg-purple-50 text-purple-700 border-purple-100';
    if (newPost.platform === 'TikTok') color = 'bg-pink-50 text-pink-700 border-pink-100';
    if (newPost.platform === 'Website') color = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    
    const postToAdd: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      day: newPost.day || 1,
      platform: newPost.platform as any,
      title: newPost.title || '',
      color,
      mediaType: selectedMedia?.type,
      mediaName: selectedMedia?.name,
      analytics: { reach: 0, engagement: 0, clicks: 0 }
    };

    setPosts([...posts, postToAdd]);
    setIsAddModalOpen(false);
    setNewPost({ day: new Date().getDate(), title: '', platform: 'Facebook' });
    setSelectedMedia(null);
  };

  const generateAIContent = () => {
    setIsGenerating(true);
    setGeneratedPosts([]);
    setTimeout(() => {
      setGeneratedPosts([
        "🔥 Protecting your home starts with the right equipment. Check out our latest fire detection systems! #FireSafety #AA2000",
        "Did you know? Regular maintenance of your alarm systems can save lives. 🛡️ Book a tech visit today! #AA2000Connect",
        "Introducing the 2026 Smart Sensor line. Sleek, efficient, and neural-ready. 🤖 #Innovation #Safety"
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const platforms = [
    { id: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'Viber', icon: MessageCircle, color: 'text-purple-600' },
    { id: 'TikTok', icon: Video, color: 'text-pink-500' },
    { id: 'Website', icon: Globe, color: 'text-emerald-500' }
  ];

  return (
    <AnimatedPage className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 tracking-tight mb-1 uppercase">Social Strategy Hub</h1>
          <p className="sub-title mb-0 opacity-60">Multi-Channel Marketing & Performance</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-surface-border">
          {['Calendar', 'Analytics', 'Automations'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-navy-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                 <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-surface-border">
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-navy-900"><ChevronLeft size={16} /></button>
                    <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-navy-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-navy-900"><ChevronRight size={16} /></button>
                 </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="premium-button flex items-center gap-2"
              >
                <Plus size={16} />
                <span>New Broadcast</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="bg-slate-50/80 p-3 text-[9px] font-semibold text-slate-400 uppercase text-center tracking-[0.2em]">{day}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const dayPosts = posts.filter(p => p.day === i + 1);
                const isToday = i + 1 === new Date().getDate();
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      setNewPost({ ...newPost, day: i + 1 });
                      setIsAddModalOpen(true);
                    }}
                    className={cn(
                      "bg-white min-h-[110px] p-2.5 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                      isToday ? "bg-brand-blue/[0.02]" : ""
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className={cn(
                         "text-[10px] font-semibold transition-colors",
                         isToday ? "text-brand-blue" : "text-slate-200 group-hover:text-navy-900"
                       )}>{i + 1}</span>
                    </div>
                    <div className="space-y-1">
                      {dayPosts.map((p, idx) => (
                        <div key={idx} className={cn("p-1.5 border rounded-lg flex items-center gap-1.5 overflow-hidden shadow-sm transition-transform hover:scale-[1.02]", p.color)}>
                          {p.platform === 'Facebook' && <Facebook size={10} />}
                          {p.platform === 'Instagram' && <Instagram size={10} />}
                          {p.platform === 'Viber' && <MessageCircle size={10} />}
                          {p.platform === 'TikTok' && <Video size={10} />}
                          {p.platform === 'Website' && <Globe size={10} />}
                          <span className="text-[8px] font-semibold uppercase tracking-tight truncate leading-none">{p.title}</span>
                          {(p.mediaType) && <ImageIcon size={8} className="ml-auto shrink-0 opacity-50" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {/* Real-time Quick Stats */}
            <div className="glass-card p-6 bg-navy-900 text-white border-none relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full -mr-16 -mt-16"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-light">Real-Time Performance</h3>
                     <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="sub-title mb-0 opacity-60">Total Reach</p>
                        <h4 className="text-xl font-semibold uppercase">24.8K</h4>
                        <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-semibold">
                           <ChevronRight size={10} className="-rotate-90" />
                           <span>+12% vs LW</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="sub-title mb-0 opacity-60">Engagement</p>
                        <h4 className="text-xl font-semibold uppercase">4.2%</h4>
                        <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-semibold">
                           <ChevronRight size={10} className="-rotate-90" />
                           <span>+5.1% vs LW</span>
                        </div>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                     <button 
                      onClick={() => setActiveTab('Analytics')}
                      className="w-full text-center text-[10px] font-semibold uppercase tracking-widest text-brand-blue hover:text-brand-light transition-all"
                     >
                       Detailed Insights
                     </button>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-blue shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-900">AI Post Engine</h3>
                  <p className="sub-title mb-0 opacity-60">Ready to synthesize copy</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Topic (e.g. Smoke Detectors)"
                  className="input-field"
                />
                <button 
                  onClick={generateAIContent}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-semibold uppercase tracking-[0.15em] text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 hover:bg-brand-light"
                >
                  {isGenerating ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{isGenerating ? 'Synthesizing...' : 'Generate AI Posts'}</span>
                </button>
                
                {generatedPosts.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {generatedPosts.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl group relative hover:border-brand-blue/30 transition-all cursor-pointer">
                        <p className="text-[10px] text-navy-900 leading-relaxed pr-6">{p}</p>
                        <button onClick={() => { setNewPost({...newPost, title: p}); setIsAddModalOpen(true); }} className="absolute top-2 right-2 p-1 text-brand-blue opacity-0 group-hover:opacity-100 transition-all">
                           <Plus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[
               { label: 'Impressions', val: '142,300', icon: Eye, color: 'text-blue-500' },
               { label: 'Link Clicks', val: '8,432', icon: MousePointer2, color: 'text-emerald-500' },
               { label: 'Followers', val: '12,500', icon: Users, color: 'text-purple-500' },
               { label: 'Avg. ROI', val: '320%', icon: BarChart3, color: 'text-brand-blue' },
             ].map(stat => (
               <div key={stat.label} className="glass-card p-6 flex items-center justify-between">
                  <div>
                    <p className="sub-title mb-1 opacity-60">{stat.label}</p>
                    <h4 className="text-2xl font-semibold text-navy-900">{stat.val}</h4>
                  </div>
                  <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
                    <stat.icon size={24} />
                  </div>
               </div>
             ))}
          </div>

          <div className="glass-card overflow-hidden">
             <div className="p-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-900">Top Performing Broadcasts</h3>
                <div className="flex gap-2">
                   <button onClick={() => alert('Showing last 7 days...')} className="px-3 py-1.5 bg-white border border-surface-border rounded-lg text-[9px] font-semibold uppercase tracking-widest text-slate-500">Last 7 Days</button>
                   <button onClick={() => alert('Exporting CSV...')} className="px-3 py-1.5 bg-white border border-surface-border rounded-lg text-[9px] font-semibold uppercase tracking-widest text-slate-500">Export CSV</button>
                </div>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/30 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-surface-border">
                      <th className="px-8 py-4">Broadcast Source</th>
                      <th className="px-8 py-4">Platform</th>
                      <th className="px-8 py-4">Reach</th>
                      <th className="px-8 py-4">Engagement</th>
                      <th className="px-8 py-4">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                   {posts.map(post => (
                     <tr key={post.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-semibold text-[10px] uppercase">
                                {post.title.substring(0, 2)}
                              </div>
                              <span className="text-xs font-medium text-navy-900 uppercase tracking-wide">{post.title}</span>
                           </div>
                        </td>
                        <td className="px-8 py-4">
                           <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold uppercase tracking-tighter">
                             {post.platform}
                           </span>
                        </td>
                        <td className="px-8 py-4 text-xs font-medium text-navy-900">{post.analytics?.reach.toLocaleString()}</td>
                        <td className="px-8 py-4">
                           <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue" style={{ width: `${(post.analytics?.engagement || 0) / 10}%` }}></div>
                           </div>
                           <span className="text-[10px] font-medium text-slate-400 mt-1 block uppercase">{post.analytics?.engagement}% engagement</span>
                        </td>
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Active</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-surface-border overflow-hidden animate-in">
            <div className="px-10 py-6 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-xl shadow-brand-blue/20">
                    <CalendarIcon size={20} />
                 </div>
                 <div>
                    <h2 className="text-base font-semibold text-navy-900 uppercase tracking-[0.15em]">Create Broadcast</h2>
                    <p className="sub-title mb-0 opacity-60">Prepare your multi-channel message</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-navy-900"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="sub-title">Post Caption</label>
                  <textarea 
                    rows={3}
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="input-field min-h-[120px] resize-none p-5 normal-case"
                    placeholder="Describe your content strategy..."
                  />
                </div>

                <div className="space-y-2">
                   <label className="sub-title block">Media Asset (Photo/Video)</label>
                   <div className="grid grid-cols-1 gap-4">
                      {!selectedMedia ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 hover:border-brand-blue/40 hover:bg-slate-50/50 transition-all cursor-pointer group">
                           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:scale-110 transition-all">
                              <Upload size={24} />
                           </div>
                           <div>
                              <p className="text-[11px] font-semibold text-navy-900 uppercase tracking-widest">Upload Media</p>
                              <p className="sub-title mt-1 mb-0 opacity-60">Drag & drop or browse files (Max 50MB)</p>
                           </div>
                           <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedMedia({ 
                                  type: file.type.startsWith('video') ? 'video' : 'image',
                                  name: file.name
                                });
                              }
                            }}
                            id="media-upload"
                           />
                           <label htmlFor="media-upload" className="absolute inset-0 cursor-pointer"></label>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                                 {selectedMedia.type === 'video' ? <FileVideo size={20} /> : <ImageIcon size={20} />}
                              </div>
                              <div>
                                 <p className="text-xs font-medium text-emerald-900 uppercase">{selectedMedia.name}</p>
                                 <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-widest">Asset Ready for Upload</p>
                              </div>
                           </div>
                           <button onClick={() => setSelectedMedia(null)} className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all">
                              <X size={16} />
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="sub-title">Target Day</label>
                    <input 
                      type="number" 
                      min="1" max="31"
                      required
                      value={newPost.day}
                      onChange={(e) => setNewPost({ ...newPost, day: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="sub-title">Broadcast Channel</label>
                    <select 
                      value={newPost.platform}
                      onChange={(e) => setNewPost({ ...newPost, platform: e.target.value as any })}
                      className="input-field cursor-pointer"
                    >
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-5 px-6 bg-slate-50 text-slate-500 rounded-3xl font-semibold hover:bg-slate-100 transition-all text-[11px] uppercase tracking-[0.2em] border border-slate-200"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 px-6 bg-brand-blue text-white rounded-3xl font-semibold uppercase tracking-[0.2em] text-[11px] hover:bg-brand-light transition-all shadow-2xl shadow-brand-blue/20 active:scale-95"
                >
                  Schedule Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SocialPlannerPage;
