import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Paperclip,
  Smile,
  Plus,
  Inbox,
  Phone,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Zap,
  Tag,
  Globe,
  MessageCircle,
  Video,
  Image,
  Layout,
  Bot,
  Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

interface ChatMessage {
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'Viber' | 'Facebook' | 'Instagram' | 'Website' | 'TikTok';
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
  status: 'Lead' | 'Client' | 'VIP';
  messages: ChatMessage[];
  aiActive: boolean;
  needsHandover?: boolean;
  isAnalyzingImage?: boolean;
}

const seedConversations: Conversation[] = [
  { id: 1, name: 'Juan Dela Cruz', channel: 'Viber', lastMsg: 'Good morning! Ask ko lang po regarding quotation ng CCTV namin.', time: '2 min ago', unread: 2, avatar: 'JD', status: 'Lead', messages: [
    { sender: 'them', text: 'Good morning! Ask ko lang po regarding quotation ng CCTV namin.', time: '2:34 PM' },
    { sender: 'them', text: 'May pinadala po kayo last week na proposal, gusto ko sana magpa-add ng 2 cameras.', time: '2:35 PM' },
  ], aiActive: true },
  { id: 2, name: 'Maria Santos', channel: 'Facebook', lastMsg: 'Sige po, check ko na lang yung availability ng technician.', time: '15 min ago', unread: 1, avatar: 'MS', status: 'Client', messages: [
    { sender: 'them', text: 'Na-schedule na po ba yung maintenance ng gate namin?', time: '3:00 PM' },
    { sender: 'me', text: 'Sige po, check ko na lang yung availability ng technician.', time: '3:02 PM' },
  ], aiActive: false },
  { id: 3, name: 'Carlos Reyes', channel: 'WhatsApp', lastMsg: 'Will you be able to send the revised contract today?', time: '1 hr ago', unread: 0, avatar: 'CR', status: 'VIP', messages: [
    { sender: 'them', text: 'Will you be able to send the revised contract today?', time: '1:00 PM' },
  ], aiActive: true, needsHandover: true },
  { id: 4, name: 'Ana Lim', channel: 'Website', lastMsg: 'How much po yung basic alarm system for a 2BR condo?', time: '3 hrs ago', unread: 0, avatar: 'AL', status: 'Lead', messages: [
    { sender: 'them', text: 'How much po yung basic alarm system for a 2BR condo?', time: '11:00 AM' },
  ], aiActive: true },
  { id: 5, name: 'Ramon Bautista', channel: 'Instagram', lastMsg: 'Ganda ng bagong post niyo about solar! May pm po ako.', time: '1 day ago', unread: 0, avatar: 'RB', status: 'Lead', messages: [
    { sender: 'them', text: 'Ganda ng bagong post niyo about solar! May pm po ako.', time: 'Yesterday' },
  ], aiActive: false },
  { id: 6, name: 'Grace Torres', channel: 'TikTok', lastMsg: 'Available pa po ba yung naka-feature na smart lock?', time: '2 days ago', unread: 0, avatar: 'GT', status: 'Client', messages: [
    { sender: 'them', text: 'Available pa po ba yung naka-feature na smart lock?', time: '2 days ago' },
  ], aiActive: false },
  { id: 7, name: 'Robert Limjoco', channel: 'Email', lastMsg: 'Please find attached the signed contract for the annual maintenance.', time: '3 days ago', unread: 0, avatar: 'RL', status: 'VIP', messages: [
    { sender: 'them', text: 'Please find attached the signed contract for the annual maintenance.', time: '3 days ago' },
  ], aiActive: false },
  { id: 8, name: 'Sofia Gonzales', channel: 'SMS', lastMsg: 'Reminder: may schedule po kami bukas ng 9am for fire alarm testing.', time: '5 days ago', unread: 0, avatar: 'SG', status: 'Client', messages: [
    { sender: 'me', text: 'Reminder: may schedule po kami bukas ng 9am for fire alarm testing.', time: '5 days ago' },
    { sender: 'them', text: 'Noted po, sir! Thanks for the heads up.', time: '5 days ago' },
  ], aiActive: false },
];

const UnifiedInboxPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isNoteMode, setIsNoteMode] = useState(false);

  const activeChat = useMemo(() => 
    conversations.find(c => c.id === activeChatId),
  [conversations, activeChatId]);

  const toggleAI = (id: number) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, aiActive: !c.aiActive, needsHandover: false } : c
    ));
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!msg.trim() || activeChatId === null) return;

    const newMessage: ChatMessage = {
      sender: 'me',
      text: msg,
      time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date())
    };

    setConversations(conversations.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMsg: msg,
          time: 'Just now',
          unread: 0,
          aiActive: false // Manual message turns off AI
        };
      }
      return c;
    }));
    setMsg('');
  };

  const filteredConversations = useMemo(() => 
    conversations.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.lastMsg.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || c.channel === filter;
      return matchesSearch && matchesFilter;
    }),
  [conversations, searchTerm, filter]);

  const channels = ['All', 'Viber', 'Facebook', 'Instagram', 'Website', 'TikTok', 'WhatsApp', 'Email', 'SMS'];

  return (
    <AnimatedPage className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden relative pb-4">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col glass-card overflow-hidden">
        <div className="p-5 border-b border-surface-border space-y-4 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 tracking-tight">Inbox</h2>
            <div className="flex gap-2">
               <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                  <Filter size={16} className="text-slate-400" />
               </button>
               <button className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                  <Zap size={16} className="text-brand-blue" />
               </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search all channels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {channels.map(c => (
              <button 
                key={c} 
                onClick={() => setFilter(c)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                  filter === c 
                    ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                    : "bg-white text-slate-500 border-surface-border hover:border-slate-300"
                )}
              >
                {c === 'Facebook' && <Layout size={12} />}
                {c === 'Instagram' && <Image size={12} />}
                {c === 'Website' && <Globe size={12} />}
                {c === 'TikTok' && <Video size={12} />}
                {c === 'Viber' && <MessageCircle size={12} />}
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-slate-50/20">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "p-4 border-b border-slate-50 cursor-pointer transition-all flex gap-4 group relative",
                  activeChatId === chat.id ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                )}
              >
                {activeChatId === chat.id && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-brand-blue"></div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-md group-hover:scale-105 transition-transform uppercase italic">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-navy-900 truncate">{chat.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className={cn(
                       "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight",
                       chat.status === 'VIP' ? "bg-amber-100 text-amber-700" :
                       chat.status === 'Client' ? "bg-emerald-100 text-emerald-700" :
                       "bg-blue-100 text-blue-700"
                     )}>
                        {chat.status}
                     </span>
                     <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        • {chat.channel}
                     </span>
                     {chat.aiActive && (
                        <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded text-[8px] font-black uppercase flex items-center gap-1">
                           <Bot size={8} /> AI Active
                        </span>
                     )}
                     {chat.needsHandover && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] font-black uppercase animate-pulse">
                           Handover
                        </span>
                     )}
                     {chat.isAnalyzingImage && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[8px] font-black uppercase flex items-center gap-1">
                           <Eye size={8} /> Internal Processing
                        </span>
                     )}
                  </div>
                  <p className={cn(
                    "text-[11px] truncate leading-snug",
                    chat.unread > 0 ? "font-bold text-navy-900" : "text-slate-500"
                  )}>
                    {chat.lastMsg}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-brand-blue text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg shadow-brand-blue/20">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
               <Inbox size={48} strokeWidth={1} className="mb-4 text-slate-400" />
               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Inbox is empty</p>
                  <p className="text-[10px] font-medium text-slate-400 max-w-[200px] mx-auto">Waiting for inquiries from Viber, FB, IG, Website, and TikTok...</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center font-bold text-white shadow-lg text-sm uppercase italic">
                  {activeChat.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-navy-900">{activeChat.name}</h3>
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full animate-pulse", activeChat.aiActive ? "bg-brand-blue" : "bg-emerald-500")}></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {activeChat.aiActive ? 'AI Monitoring' : 'Active Channel Thread'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl mr-2">
                   <div className="flex items-center gap-1.5">
                      <Bot size={14} className={cn(activeChat.aiActive ? "text-brand-blue" : "text-slate-400")} />
                      <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider">AI Agent</span>
                   </div>
                   <button 
                    onClick={() => toggleAI(activeChat.id)}
                    className={cn(
                      "relative inline-flex h-4 w-8 items-center rounded-full transition-colors",
                      activeChat.aiActive ? "bg-brand-blue" : "bg-slate-300"
                    )}
                   >
                     <span className={cn("inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform", activeChat.aiActive ? "translate-x-4" : "translate-x-1")} />
                   </button>
                </div>
                <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100" title="Voice Call">
                  <Phone size={20} className="text-slate-400" />
                </button>
                <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100" title="Contact Info">
                  <User size={20} className="text-slate-400" />
                </button>
                <div className="h-6 w-px bg-slate-100 mx-2"></div>
                <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <MoreVertical size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#f8fafc]">
              {activeChat.messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[75%] animate-in slide-in-from-bottom-2 duration-300",
                  m.sender === 'me' ? "ml-auto flex-row-reverse" : ""
                )}>
                  {m.sender !== 'me' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500 mt-auto mb-1 uppercase italic">
                      {activeChat.avatar}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className={cn(
                      "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      m.sender === 'me' 
                        ? "bg-brand-blue text-white rounded-br-none" 
                        : "bg-white border border-slate-100 rounded-bl-none text-navy-900"
                    )}>
                      {m.text}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2",
                      m.sender === 'me' ? "text-right block text-slate-400" : "text-slate-400"
                    )}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="relative group">
                <div className="flex flex-col bg-slate-50/50 border border-slate-200 rounded-2xl transition-all focus-within:bg-white focus-within:border-brand-blue focus-within:shadow-lg focus-within:shadow-brand-blue/5">
                  <textarea 
                    rows={2}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Reply to ${activeChat.name.split(' ')[0]} via ${activeChat.channel}...`}
                    className="w-full bg-transparent border-none outline-none px-5 py-4 text-sm font-medium resize-none text-navy-900 placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all">
                        <Paperclip size={18} />
                      </button>
                      <button type="button" className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all">
                        <Smile size={18} />
                      </button>
                      <button type="button" className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all">
                        <Tag size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        type="button" 
                        onClick={() => setIsNoteMode(!isNoteMode)}
                        className={cn("text-[10px] font-bold uppercase tracking-widest transition-all", isNoteMode ? "text-brand-blue" : "text-slate-400 hover:text-navy-900")}
                       >
                         Internal Note
                       </button>
                       <button 
                        type="submit"
                        className={cn(
                          "flex items-center gap-2 pl-6 pr-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all",
                          msg.trim() 
                            ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20 scale-105" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                        disabled={!msg.trim()}
                      >
                        <span>Send</span>
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 bg-[#f8fafc]">
             <div className="relative">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-brand-blue border border-slate-100">
                   <MessageSquare size={40} strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#f8fafc]">
                   <Plus size={16} />
                </div>
             </div>
             <div className="max-w-xs space-y-2">
                <h3 className="text-xl font-bold text-navy-900 tracking-tight">Channel Hub</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                   Connect and manage all your enterprise social channels in one unified AA2000 inbox.
                </p>
                <div className="grid grid-cols-5 gap-3 pt-4 opacity-40">
                   <Layout size={20} title="Facebook" />
                   <Image size={20} title="Instagram" />
                   <Video size={20} title="TikTok" />
                   <MessageCircle size={20} title="Viber" />
                   <Globe size={20} title="Website" />
                </div>
             </div>
              <button onClick={() => alert('Channel configuration panel coming soon. Please check back later.')} className="px-8 py-3 bg-brand-blue text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-light transition-all shadow-xl shadow-brand-blue/20">
                Configure Channels
             </button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default UnifiedInboxPage;
