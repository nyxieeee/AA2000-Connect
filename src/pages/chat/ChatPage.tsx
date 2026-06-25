import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, MessageSquare, Plus, User, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useChatStore } from '../../stores/modules/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { AnimatedPage, AnimatedList } from '../../components/ui/AnimatedPage';

export default function ChatPage() {
  const { channels, messages, activeChannelId, setActiveChannel, createChannel, sendMessage, deleteMessage, deleteChannel } = useChatStore();
  const user = useAuthStore(s => s.user);
  const [input, setInput] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = useMemo(() => activeChannelId ? messages[activeChannelId] || [] : [], [activeChannelId, messages]);
  const activeChannel = activeChannelId ? channels.find(c => c.id === activeChannelId) : null;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeMessages]);

  const handleSend = () => {
    if (!input.trim() || !activeChannelId || !user) return;
    sendMessage(activeChannelId, user.id, user.name, input.trim());
    setInput('');
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    createChannel({ name: newChannelName.trim(), isDm: false });
    setNewChannelName(''); setShowNewChannel(false);
  };

  return (
    <AnimatedPage className="flex h-[calc(100vh-120px)] -mx-6 -mt-6 overflow-hidden">
      {/* Channel list */}
      <div className="w-72 bg-white border-r border-surface-border flex flex-col shrink-0">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900">Channels</h2>
          <button onClick={() => setShowNewChannel(true)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all">
            <Plus size={16} />
          </button>
        </div>
        {showNewChannel && (
          <div className="p-3 border-b border-surface-border space-y-2">
            <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="Channel name" className="w-full px-3 py-1.5 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none" autoFocus />
            <div className="flex gap-1">
              <button onClick={handleCreateChannel} className="px-3 py-1 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all">Create</button>
              <button onClick={() => setShowNewChannel(false)} className="px-3 py-1 text-xs font-semibold text-slate-500">Cancel</button>
            </div>
          </div>
        )}
        <AnimatedList className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {channels.map(ch => (
            <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group', activeChannelId === ch.id ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 text-slate-600')}>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {ch.isDm ? <User size={14} className="text-slate-500" /> : <MessageSquare size={14} className="text-slate-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{ch.name || 'Unnamed'}</p>
                {ch.lastMessage && <p className="text-[9px] text-slate-400 truncate mt-0.5">{ch.lastMessage}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteChannel(ch.id); }} className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
            </button>
          ))}
        </AnimatedList>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChannel ? (
          <>
            <div className="px-6 py-3 border-b border-surface-border bg-slate-50/50">
              <h3 className="text-sm font-bold text-navy-900">{activeChannel.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeMessages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-md px-4 py-2.5 rounded-2xl group relative', isMe ? 'bg-brand-blue text-white' : 'bg-slate-100 text-navy-900')}>
                      {!isMe && <p className="text-[10px] font-bold text-brand-blue mb-0.5">{msg.senderName}</p>}
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-[9px] mt-1', isMe ? 'text-white/60' : 'text-slate-400')}>{new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                        <button onClick={() => deleteMessage(msg.channelId, msg.id)} className="opacity-0 group-hover:opacity-100 text-[9px] text-slate-400 hover:text-rose-500 transition-all">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-surface-border bg-white">
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..." className="flex-1 px-4 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10" />
                <button onClick={handleSend} className="w-9 h-9 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-light transition-all shrink-0">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
              <p className="text-sm text-slate-500 font-medium">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
