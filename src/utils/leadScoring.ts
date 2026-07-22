// AA2000 Connect — Dynamic Lead Scoring Engine
import type { Contact } from '../services/db';
import type { EngagementEvent, BuyingSignal } from '../stores/modules/engagementStore';

export interface ScoreBreakdown {
  totalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  heatLabel: 'Hot Lead' | 'Warm Prospect' | 'Nurturing' | 'Cold';
  basePoints: number;
  engagementPoints: number;
  signalBonus: number;
  factors: string[];
}

export function computeContactScore(
  contact: Contact,
  events: EngagementEvent[] = [],
  buyingSignal?: BuyingSignal | null
): ScoreBreakdown {
  let basePoints = contact.score || 50;
  let engagementPoints = 0;
  let signalBonus = 0;
  const factors: string[] = [];

  // Profile completeness & tags
  if (contact.companyId) {
    basePoints += 5;
    factors.push('Linked to Enterprise (+5 pts)');
  }
  if (contact.tags?.includes('VIP')) {
    basePoints += 15;
    factors.push('VIP Contact Tier (+15 pts)');
  }
  if (contact.tags?.includes('Enterprise') || contact.tags?.includes('Hot Lead')) {
    basePoints += 10;
    factors.push('High-Value Lead Tag (+10 pts)');
  }

  // Engagement Events Calculation
  const contactEvents = events.filter(e => e.contactId === contact.id || (e.recipient && e.recipient.toLowerCase() === contact.email.toLowerCase()));
  
  contactEvents.forEach(e => {
    if (e.action === 'submitted') {
      engagementPoints += 25;
      factors.push('Web Form Submitted (+25 pts)');
    } else if (e.action === 'clicked' && /quote|pricing|price|buy|checkout|plan/i.test(e.metadata?.linkUrl || '')) {
      engagementPoints += 20;
      factors.push('Clicked Pricing/Quote Link (+20 pts)');
    } else if (e.action === 'replied') {
      engagementPoints += 15;
      factors.push('Replied to Outreach (+15 pts)');
    } else if (e.action === 'opened' || e.action === 'read') {
      engagementPoints += 5;
    } else if (e.action === 'viewed') {
      engagementPoints += 5;
    }
  });

  const openCount = contactEvents.filter(e => e.action === 'opened' || e.action === 'read').length;
  if (openCount > 0) {
    factors.push(`${openCount} Open/Read Events (+${openCount * 5} pts)`);
  }

  // Buying Signal Bonus
  if (buyingSignal) {
    if (buyingSignal.signal === 'closing') {
      signalBonus += 25;
      factors.push('Closing Ready Signal (+25 pts)');
    } else if (buyingSignal.signal === 'hot') {
      signalBonus += 15;
      factors.push('Hot Intent Signal (+15 pts)');
    } else if (buyingSignal.signal === 'warm') {
      signalBonus += 10;
      factors.push('Warm Interest Signal (+10 pts)');
    }
  }

  const rawTotal = basePoints + engagementPoints + signalBonus;
  const totalScore = Math.min(100, Math.max(0, rawTotal));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  let heatLabel: 'Hot Lead' | 'Warm Prospect' | 'Nurturing' | 'Cold' = 'Nurturing';

  if (totalScore >= 85) {
    grade = 'A+';
    heatLabel = 'Hot Lead';
  } else if (totalScore >= 75) {
    grade = 'A';
    heatLabel = 'Hot Lead';
  } else if (totalScore >= 60) {
    grade = 'B';
    heatLabel = 'Warm Prospect';
  } else if (totalScore >= 40) {
    grade = 'C';
    heatLabel = 'Nurturing';
  } else {
    grade = 'D';
    heatLabel = 'Cold';
  }

  return {
    totalScore,
    grade,
    heatLabel,
    basePoints,
    engagementPoints,
    signalBonus,
    factors: Array.from(new Set(factors)),
  };
}
