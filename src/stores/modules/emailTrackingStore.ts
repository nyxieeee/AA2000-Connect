import { create } from 'zustand';
import { storage } from '../../services/storage';

export interface EmailEvent {
  id: string;
  emailId: string;
  recipient: string;
  type: 'sent' | 'opened' | 'clicked';
  timestamp: string;
  metadata?: { linkUrl?: string; openCount?: number };
}

export interface EmailCampaign {
  id: string;
  subject: string;
  recipient: string;
  dealId?: string;
  contactId?: string;
  sentAt: string;
  openCount: number;
  lastOpenedAt?: string;
  clickedLinks: { url: string; clickedAt: string }[];
}

export interface BuyingSignal {
  campaignId: string;
  signal: 'cold' | 'warm' | 'hot' | 'closing';
  label: string;
  reason: string;
  detectedAt: string;
}

interface EmailTrackingStore {
  events: EmailEvent[];
  campaigns: EmailCampaign[];
  addEvent: (event: Omit<EmailEvent, 'id' | 'timestamp'>) => void;
  addCampaign: (campaign: Omit<EmailCampaign, 'id' | 'openCount' | 'clickedLinks'>) => void;
  recordOpen: (campaignId: string) => void;
  recordClick: (campaignId: string, url: string) => void;
  getEngagedCampaigns: () => EmailCampaign[];
  getBuyingSignals: () => BuyingSignal[];
  getSignalForCampaign: (campaign: EmailCampaign) => BuyingSignal | null;
}

function analyzeSignal(campaign: EmailCampaign): BuyingSignal | null {
  if (campaign.openCount === 0 && campaign.clickedLinks.length === 0) return null;

  const now = Date.now();
  const sentMs = new Date(campaign.sentAt).getTime();
  const hoursSinceSent = (now - sentMs) / 3600000;

  const clickedPricing = campaign.clickedLinks.some(l =>
    /quote|pricing|price|buy|checkout|plan/i.test(l.url)
  );

  const multipleOpens = campaign.openCount >= 3;
  const recentOpen = campaign.lastOpenedAt && (now - new Date(campaign.lastOpenedAt).getTime()) < 3600000;

  if (clickedPricing && multipleOpens) {
    return { campaignId: campaign.id, signal: 'closing', label: 'Closing Ready', reason: 'Clicked pricing link and re-opened email multiple times — ready for close.', detectedAt: new Date().toISOString() };
  }
  if (clickedPricing) {
    return { campaignId: campaign.id, signal: 'hot', label: 'Hot Lead', reason: 'Clicked a pricing/quote link — high purchase intent.', detectedAt: new Date().toISOString() };
  }
  if (recentOpen && multipleOpens) {
    return { campaignId: campaign.id, signal: 'hot', label: 'Hot Lead', reason: 'Opened email 3+ times, last open within the hour — actively reviewing.', detectedAt: new Date().toISOString() };
  }
  if (multipleOpens) {
    return { campaignId: campaign.id, signal: 'warm', label: 'Warm Lead', reason: `Opened email ${campaign.openCount} times — sustained interest.`, detectedAt: new Date().toISOString() };
  }
  if (hoursSinceSent < 24 && campaign.openCount >= 1) {
    return { campaignId: campaign.id, signal: 'warm', label: 'Warm Lead', reason: 'Opened within 24 hours of sending — prompt engagement.', detectedAt: new Date().toISOString() };
  }
  if (campaign.clickedLinks.length > 0) {
    return { campaignId: campaign.id, signal: 'warm', label: 'Warm', reason: `Clicked ${campaign.clickedLinks.length} link(s) — engaged.`, detectedAt: new Date().toISOString() };
  }
  return { campaignId: campaign.id, signal: 'cold', label: 'Cold', reason: `Opened ${campaign.openCount} time(s), no clicks — needs follow-up.`, detectedAt: new Date().toISOString() };
}

export const useEmailTrackingStore = create<EmailTrackingStore>((set, get) => ({
  events: storage.get<EmailEvent[]>('module_email_events') || [],
  campaigns: storage.get<EmailCampaign[]>('module_email_campaigns') || [],
  addEvent: (data) => {
    const event: EmailEvent = { ...data, id: `evt-${Date.now()}`, timestamp: new Date().toISOString() };
    const updated = [...get().events, event];
    storage.set('module_email_events', updated); set({ events: updated });
  },
  addCampaign: (data) => {
    const campaign: EmailCampaign = { ...data, id: `em-${Date.now()}`, openCount: 0, clickedLinks: [] };
    const updated = [...get().campaigns, campaign];
    storage.set('module_email_campaigns', updated); set({ campaigns: updated });
  },
  recordOpen: (campaignId) => {
    const updated = get().campaigns.map(c =>
      c.id === campaignId
        ? { ...c, openCount: c.openCount + 1, lastOpenedAt: new Date().toISOString() }
        : c
    );
    storage.set('module_email_campaigns', updated); set({ campaigns: updated });
    get().addEvent({ emailId: campaignId, recipient: '', type: 'opened', metadata: { openCount: 1 } });
  },
  recordClick: (campaignId, url) => {
    const updated = get().campaigns.map(c =>
      c.id === campaignId
        ? { ...c, clickedLinks: [...c.clickedLinks, { url, clickedAt: new Date().toISOString() }] }
        : c
    );
    storage.set('module_email_campaigns', updated); set({ campaigns: updated });
    get().addEvent({ emailId: campaignId, recipient: '', type: 'clicked', metadata: { linkUrl: url } });
  },
  getEngagedCampaigns: () => {
    return get().campaigns.filter(c => c.openCount > 0 || c.clickedLinks.length > 0);
  },
  getBuyingSignals: () => {
    return get().campaigns.map(analyzeSignal).filter((s): s is BuyingSignal => s !== null);
  },
  getSignalForCampaign: (campaign) => {
    return analyzeSignal(campaign);
  },
}));
