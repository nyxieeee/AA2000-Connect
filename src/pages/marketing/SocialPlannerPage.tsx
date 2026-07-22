import { useState } from 'react';
import { createPortal } from 'react-dom';
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
import { storage } from '../../services/storage';

interface ScheduledPost {
  id: string;
  day: number;
  date?: string;
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

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SocialPlannerPage = () => {
  const [activeTab, setActiveTab] = useState('Calendar');
  const [posts, setPosts] = useState<ScheduledPost[]>(() => storage.get('mktg_posts') || [
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({ 
    day: new Date().getDate(), 
    title: '', 
    platform: 'Facebook',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video', name: string} | null>(null);
  const [aiTopic, setAiTopic] = useState('');

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  let firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

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
      date: newPost.date || new Date().toISOString().split('T')[0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platform: newPost.platform as any,
      title: newPost.title || '',
      color,
      mediaType: selectedMedia?.type,
      mediaName: selectedMedia?.name,
      analytics: { reach: 0, engagement: 0, clicks: 0 }
    };

    const updated = [...posts, postToAdd];
    setPosts(updated);
    storage.set('mktg_posts', updated);
    setIsAddModalOpen(false);
    setNewPost({ 
      day: new Date().getDate(), 
      title: '', 
      platform: 'Facebook',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedMedia(null);
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    setGeneratedPosts([]);

    const topic = aiTopic.trim() || 'AA2000 Security and Technology Solutions';
    const systemPrompt = `You are a professional social media marketing copywriter for AA2000 Security & Technology Solutions Inc., a leading system integrator specializing in fire safety, security, and building automation (FDAS, CCTV, Access Control, Structured Cabling, Suppression).
Generate exactly 3 diverse, highly detailed, professional, engaging, and high-quality social media posts on the topic requested by the user.
Each post should:
1. Have an attention-grabbing, professional header.
2. Provide informative, educational, or engaging copy (1-2 short paragraphs) that explains the importance, benefits, or industry standards related to the topic.
3. Include a clear call to action (CTA).
4. Include 3-4 professional hashtags (like #FireSafety, #AA2000, #CCTV, #SmartSolutions) without emojis.
Do not use any Markdown formatting (no hashes, no asterisks, no headers). Output each post as a single block. Separate each of the 3 posts with the exact text delimiter '---POST_SPLIT---'. Do not use any emojis.`;

    const userPrompt = `Generate 3 detailed marketing posts about the topic: "${topic}".`;

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
        console.error('AI post gen (Groq) failed, trying Mistral:', e);
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
        console.error('AI post gen (Mistral) failed, trying Gemini:', e);
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
        console.error('AI post gen (Gemini) failed:', e);
      }
    }

    if (success && resultsText) {
      const items = resultsText
        .split('---POST_SPLIT---')
        .map(post => post.replace(/\*\*/g, '').trim())
        .filter(post => post.length > 0)
        .slice(0, 3);
      if (items.length > 0) {
        setGeneratedPosts(items);
        setIsGenerating(false);
        return;
      }
    }

    // Offline simulation fallback
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setGeneratedPosts([
      `Ensuring compliance with local fire safety codes is not just a regulatory checkmark—it is a foundational pillar of business continuity. Our team at AA2000 specializes in integrating state-of-the-art Fire Detection and Alarm Systems (FDAS) tailored to your building's unique architecture. From addressable smoke detectors to centralized control panels, we guarantee high-reliability monitoring. Contact our engineering team today to schedule an audit. #FireSafety #BuildingSafety #Compliance #AA2000`,
      `Modern CCTV networks do more than record footage—they serve as the proactive eyes of your security team. With intelligent video analytics, perimeter intrusion detection, and high-definition low-light coverage, AA2000 integrates comprehensive surveillance systems that secure your assets 24/7. Connect with us to design a centralized command center for your facility. #Surveillance #SecuritySystems #SafetyFirst #CCTV #AA2000`,
      `A robust structured cabling system is the nervous system of your business communication. AA2000 provides certified copper and fiber optic installations that support high-speed data transmission, reducing latency and maximizing uptime for your enterprise applications. Contact our technical consultants to upgrade your communication infrastructure. #StructuredCabling #FiberOptic #EnterpriseNetwork #TechSolutions #AA2000`
    ]);
    setIsGenerating(false);
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
          <h1 className="text-2xl font-semibold text-navy-900 tracking-tight mb-1 uppercase">Social Calendar</h1>
          <p className="sub-title mb-0 opacity-60">Schedule and track social media posts</p>
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
                      <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-navy-900"><ChevronLeft size={16} /></button>
                      <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-navy-900">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-navy-900"><ChevronRight size={16} /></button>
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
                
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`spacer-${idx}`} className="bg-slate-50/20 min-h-[110px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  const dayPosts = posts.filter(p => {
                    if (p.date) {
                      return p.date === dateStr;
                    }
                    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                    return isCurrentMonth && p.day === day;
                  });

                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <div 
                      key={day} 
                      onClick={() => {
                        setNewPost({ ...newPost, day, date: dateStr });
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
                         )}>{day}</span>
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
                        <h4 className="text-xl font-semibold uppercase text-white">24.8K</h4>
                        <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-semibold">
                           <ChevronRight size={10} className="-rotate-90" />
                           <span>+12% vs LW</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="sub-title mb-0 opacity-60">Engagement</p>
                        <h4 className="text-xl font-semibold uppercase text-white">4.2%</h4>
                        <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-semibold">
                           <ChevronRight size={10} className="-rotate-90" />
                           <span>+5.1% vs LW</span>
                        </div>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                     <button 
                      onClick={() => setActiveTab('Analytics')}
                      className="w-full text-center text-[10px] font-semibold uppercase tracking-widest text-slate-200 hover:text-white transition-all"
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
                      <div 
                        key={idx} 
                        onClick={() => { setNewPost({ ...newPost, title: p }); setIsAddModalOpen(true); }}
                        className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-brand-blue/30 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                      >
                        <p className="text-[10px] text-navy-900 leading-relaxed">{p}</p>
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
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-surface-border overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-blue text-white rounded-xl shadow-md shadow-brand-blue/15">
                    <CalendarIcon size={16} />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-navy-900 uppercase tracking-widest leading-none">Create Broadcast</h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider mb-0 opacity-80">Prepare your multi-channel message</p>
                 </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-navy-900"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Post Caption</label>
                  <textarea 
                    rows={3}
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="input-field min-h-[90px] resize-none p-3.5 normal-case text-xs"
                    placeholder="Describe your content strategy..."
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Media Asset (Photo/Video)</label>
                   <div className="grid grid-cols-1 gap-3">
                      {!selectedMedia ? (
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 hover:border-brand-blue/40 hover:bg-slate-50/50 transition-all cursor-pointer group">
                           <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:scale-110 transition-all">
                              <Upload size={18} />
                           </div>
                           <div>
                              <p className="text-[9px] font-bold text-navy-900 uppercase tracking-widest">Upload Media</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 mb-0 opacity-60">Drag & drop or browse files (Max 50MB)</p>
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
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                                 {selectedMedia.type === 'video' ? <FileVideo size={16} /> : <ImageIcon size={16} />}
                              </div>
                              <div>
                                 <p className="text-[11px] font-bold text-emerald-950 truncate max-w-[200px]">{selectedMedia.name}</p>
                                 <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">Asset Ready for Upload</p>
                              </div>
                           </div>
                           <button type="button" onClick={() => setSelectedMedia(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all">
                              <X size={14} />
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule Date</label>
                    <input 
                      type="date" 
                      required
                      value={newPost.date}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        const parsedDate = new Date(dateVal);
                        setNewPost({ 
                          ...newPost, 
                          date: dateVal, 
                          day: isNaN(parsedDate.getDate()) ? new Date().getDate() : parsedDate.getDate()
                        });
                      }}
                      className="input-field text-xs py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Broadcast Channel</label>
                    <select 
                      value={newPost.platform}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setNewPost({ ...newPost, platform: e.target.value as any })}
                      className="input-field text-xs py-2.5 cursor-pointer"
                    >
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all text-[9px] uppercase tracking-wider border border-slate-200"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-brand-blue text-white rounded-2xl font-bold uppercase tracking-wider text-[9px] hover:bg-brand-light transition-all shadow-md shadow-brand-blue/15 active:scale-95"
                >
                  Schedule Now
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </AnimatedPage>
  );
};

export default SocialPlannerPage;
