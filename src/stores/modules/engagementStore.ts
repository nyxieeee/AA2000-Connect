import { create } from 'zustand';
import { storage } from '../../services/storage';

type Channel = 'email' | 'viber' | 'whatsapp' | 'facebook' | 'instagram' | 'website';
type Action = 'sent' | 'opened' | 'read' | 'clicked' | 'replied' | 'viewed' | 'submitted';

export type { Channel, Action };

export interface EngagementEvent {
  id: string;
  channel: Channel;
  action: Action;
  contactId?: string;
  leadId?: string;
  subject?: string;
  recipient?: string;
  timestamp: string;
  metadata?: { linkUrl?: string; pageUrl?: string; messagePreview?: string };
}

export interface BuyingSignal {
  contactOrLeadId: string;
  name: string;
  channel: Channel;
  signal: 'cold' | 'warm' | 'hot' | 'closing';
  label: string;
  reason: string;
  detectedAt: string;
}

interface EngagementStore {
  events: EngagementEvent[];
  addEvent: (event: Omit<EngagementEvent, 'id' | 'timestamp'>) => void;
  getEventsForContact: (contactId: string) => EngagementEvent[];
  getBuyingSignals: () => BuyingSignal[];
  getSignalForContact: (contactId: string, name: string) => BuyingSignal | null;
}

function analyzeSignal(events: EngagementEvent[], name: string): BuyingSignal | null {
  if (events.length === 0) return null;

  const now = Date.now();
  const recentEvents = events.filter(e => now - new Date(e.timestamp).getTime() < 86400000 * 3);

  const clickedPricing = events.some(e =>
    e.action === 'clicked' && /quote|pricing|price|buy|checkout|plan/i.test(e.metadata?.linkUrl || '')
  );
  const visitedPricing = events.some(e =>
    e.action === 'viewed' && /pricing|plans|subscription/i.test(e.metadata?.pageUrl || '')
  );
  const replied = events.some(e => e.action === 'replied');
  const multipleOpens = events.filter(e => e.action === 'opened' || e.action === 'read').length >= 3;
  const recentOpen = recentEvents.some(e => e.action === 'opened' || e.action === 'read');
  const recentReply = recentEvents.some(e => e.action === 'replied');
  const filledForm = events.some(e => e.action === 'submitted');
  const channelsUsed = [...new Set(events.map(e => e.channel))];

  const channels = channelsUsed.join(', ');
  const lastChannel = events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.channel || 'email';
  const eventCount = events.length;

  if (clickedPricing || visitedPricing) {
    if (replied || multipleOpens) {
      return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'closing', label: 'Closing Ready', reason: `Clicked pricing link and engaged multiple times across ${channels} — ready to close.`, detectedAt: new Date().toISOString() };
    }
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'hot', label: 'Hot Lead', reason: `Clicked a pricing link on ${lastChannel} — high purchase intent.`, detectedAt: new Date().toISOString() };
  }
  if (filledForm) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'hot', label: 'Hot Lead', reason: `Submitted a form via ${lastChannel} — active interest.`, detectedAt: new Date().toISOString() };
  }
  if (recentReply) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'hot', label: 'Hot Lead', reason: `Replied on ${lastChannel} within the last 3 days — active conversation.`, detectedAt: new Date().toISOString() };
  }
  if (recentOpen && multipleOpens) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'hot', label: 'Hot Lead', reason: `Opened/read ${events.filter(e => e.action === 'opened' || e.action === 'read').length} times across ${channels} — actively reviewing.`, detectedAt: new Date().toISOString() };
  }
  if (multipleOpens) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'warm', label: 'Warm Lead', reason: `${eventCount} interactions across ${channels} — sustained interest.`, detectedAt: new Date().toISOString() };
  }
  if (replied) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'warm', label: 'Warm', reason: `Replied on ${lastChannel} — engaged.`, detectedAt: new Date().toISOString() };
  }
  if (channelsUsed.length > 1) {
    return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'warm', label: 'Warm', reason: `Engaged across ${channelsUsed.length} channels (${channels}) — multi-channel interest.`, detectedAt: new Date().toISOString() };
  }
  return { contactOrLeadId: events[0].contactId || events[0].leadId || '', name, channel: lastChannel, signal: 'cold', label: 'Cold', reason: `${eventCount} interaction(s) on ${lastChannel} — needs follow-up.`, detectedAt: new Date().toISOString() };
}

const seedEvents: EngagementEvent[] = [
  { id: 'evt-s1', channel: 'website', action: 'submitted', contactId: 'seed-1', subject: 'Pricing Inquiry', timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: { pageUrl: '/pricing' } },
  { id: 'evt-s2', channel: 'email', action: 'opened', contactId: 'seed-1', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'evt-s3', channel: 'email', action: 'clicked', contactId: 'seed-1', timestamp: new Date(Date.now() - 7200000).toISOString(), metadata: { linkUrl: 'https://aa2000.ph/quote' } },
  { id: 'evt-s4', channel: 'viber', action: 'read', contactId: 'seed-2', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'evt-s5', channel: 'facebook', action: 'replied', contactId: 'seed-2', timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: 'evt-s6', channel: 'website', action: 'viewed', contactId: 'seed-3', timestamp: new Date(Date.now() - 172800000).toISOString(), metadata: { pageUrl: '/features' } },
  { id: 'evt-s7', channel: 'instagram', action: 'read', contactId: 'seed-4', timestamp: new Date(Date.now() - 259200000).toISOString() },
  { id: 'evt-s8', channel: 'whatsapp', action: 'replied', contactId: 'seed-4', timestamp: new Date(Date.now() - 100000).toISOString() },
  { id: 'evt-s9', channel: 'email', action: 'opened', contactId: 'seed-5', timestamp: new Date(Date.now() - 604800000).toISOString() },
  { id: 'evt-s10', channel: 'facebook', action: 'clicked', contactId: 'seed-5', timestamp: new Date(Date.now() - 500000).toISOString(), metadata: { linkUrl: 'https://aa2000.ph/pricing' } },
];

const storedEvents = storage.get<EngagementEvent[]>('module_engagement_events');
if (!storedEvents) { storage.set('module_engagement_events', seedEvents); }

const contactNames: Record<string, string> = {
  'seed-1': 'Maria Santos',
  'seed-2': 'Juan Reyes',
  'seed-3': 'Pedro Lim',
  'seed-4': 'Luzviminda Cruz',
  'seed-5': 'Ana Gonzales',
};

export const useEngagementStore = create<EngagementStore>((set, get) => ({
  events: storedEvents || seedEvents,
  addEvent: (data) => {
    const event: EngagementEvent = { ...data, id: `evt-${Date.now()}`, timestamp: new Date().toISOString() };
    const updated = [...get().events, event];
    storage.set('module_engagement_events', updated); set({ events: updated });
  },
  getEventsForContact: (contactId) => {
    return get().events.filter(e => e.contactId === contactId || e.leadId === contactId);
  },
  getBuyingSignals: () => {
    // Dynamic contact and lead name resolver
    const storedContacts = storage.get<Array<{ id: string; name: string }>>('module_crm_contacts') || [];
    const storedLeads = storage.get<Array<{ id: string; name: string }>>('module_leads') || [];
    
    const nameMap: Record<string, string> = {
      'seed-1': 'Maria Santos',
      'seed-2': 'Juan Reyes',
      'seed-3': 'Pedro Lim',
      'seed-4': 'Luzviminda Cruz',
      'seed-5': 'Ana Gonzales',
      'c-seed-001': 'Michael Tan',
      'c-seed-002': 'Sofia Garcia',
      'c-seed-003': 'Gabriel Ramos',
      'c-seed-004': 'Patricia Mercado',
      'c-seed-005': 'Eduardo Villanueva',
      'lead-1': 'Maria Santos',
      'lead-2': 'Juan Reyes',
      'lead-3': 'Ana Gonzales',
      'lead-4': 'Pedro Lim',
      'lead-5': 'Luzviminda Cruz',
    };

    storedContacts.forEach(c => { if (c.id && c.name) nameMap[c.id] = c.name; });
    storedLeads.forEach(l => { if (l.id && l.name) nameMap[l.id] = l.name; });

    const grouped = new Map<string, EngagementEvent[]>();
    get().events.forEach(e => {
      const key = e.contactId || e.leadId || '';
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(e);
    });
    return Array.from(grouped.entries()).map(([id, events]) => analyzeSignal(events, nameMap[id] || id)).filter((s): s is BuyingSignal => s !== null);
  },
  getSignalForContact: (contactId, fallbackName) => {
    const events = get().events.filter(e => e.contactId === contactId || e.leadId === contactId);
    return analyzeSignal(events, fallbackName);
  },
}));
