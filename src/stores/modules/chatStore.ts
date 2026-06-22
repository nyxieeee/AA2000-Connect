import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface ChatChannelItem {
  id: string;
  name?: string;
  isDm: boolean;
  serviceRecordId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

interface ChatStore {
  channels: ChatChannelItem[];
  messages: Record<string, ChatMessageItem[]>;
  activeChannelId: string | null;

  fetchChannels: () => void;
  createChannel: (channel: Omit<ChatChannelItem, 'id' | 'createdAt'>) => void;
  setActiveChannel: (id: string | null) => void;
  fetchMessages: (channelId: string) => void;
  sendMessage: (channelId: string, senderId: string, senderName: string, content: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  channels: storage.get<ChatChannelItem[]>('module_chat_channels') || [],
  messages: storage.get<Record<string, ChatMessageItem[]>>('module_chat_messages') || {},
  activeChannelId: null,

  fetchChannels: () => { const channels = storage.get<ChatChannelItem[]>('module_chat_channels') || []; set({ channels }); },
  createChannel: (data) => {
    const newChannel: ChatChannelItem = { ...data, id: `ch-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...get().channels, newChannel];
    storage.set('module_chat_channels', updated); set({ channels: updated });
  },
  setActiveChannel: (id) => set({ activeChannelId: id }),
  fetchMessages: () => {
    const allMessages = storage.get<Record<string, ChatMessageItem[]>>('module_chat_messages') || {};
    set({ messages: allMessages });
  },
  sendMessage: (channelId, senderId, senderName, content) => {
    const msg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      channelId, senderId, senderName, content, sentAt: new Date().toISOString()
    };
    const messages = get().messages;
    const channelMessages = [...(messages[channelId] || []), msg];
    const updated = { ...messages, [channelId]: channelMessages };
    storage.set('module_chat_messages', updated); set({ messages: updated });

    const channels = get().channels.map(c => c.id === channelId ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() } : c);
    storage.set('module_chat_channels', channels); set({ channels });
  },
}));
