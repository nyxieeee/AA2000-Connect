// AA2000 Connect — Multi-Provider AI Recommendation Engine
// Multi-Provider Cloud AI (Groq -> Mistral -> Gemini)

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIRecommendationItem {
  id: string;
  type: 'next_step' | 'follow_up' | 'risk_alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  draftMessage?: string;
  dealId?: string;
  contactId?: string;
  contactName?: string;
  channel?: string;
  read: boolean;
  applied: boolean;
  providerUsed: 'Groq (Qwen)' | 'Mistral AI' | 'Google Gemini';
  createdAt: string;
}

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function scanAndGenerateAIRecommendations(inputData: {
  deals: Array<{ id: string; title: string; value: number; companyName: string; stageId: string; status: string }>;
  leads: Array<{ id: string; name: string; email: string; company?: string; status: string; notes?: string }>;
  signals: Array<{ id: string; name: string; channel: string; signal: string; reason: string }>;
}): Promise<AIRecommendationItem[]> {
  const prompt = `You are AA2000 Connect's Chief Sales AI Strategist for commercial security systems, CCTV, and BFP fire safety projects in the Philippines.
Analyze the following active CRM Deals, Leads, and Buying Signals and generate prioritized, actionable sales recommendations.

CRM Active Data:
Deals: ${JSON.stringify(inputData.deals.slice(0, 8))}
Leads: ${JSON.stringify(inputData.leads.slice(0, 8))}
Buying Signals: ${JSON.stringify(inputData.signals.slice(0, 8))}

Respond with ONLY valid raw JSON array matching this schema exactly (no markdown formatting, no commentary):
[
  {
    "type": "next_step",
    "title": "Action High Intent Quotation Review: MegaPlaza Corp",
    "description": "Client opened quotation 3 times in 48 hrs. Strong buying signal detected.",
    "priority": "high",
    "draftMessage": "Hi Michael, I noticed you are reviewing our CCTV & Access Control proposal. Would you like to schedule a quick 10-minute technical scope review?",
    "contactName": "Michael Tan",
    "channel": "viber"
  }
]`;

  // 1. Primary: Groq (Qwen 3.6 / GPT-OSS)
  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-2.5-32b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJson(content));
          return parsed.map((item: any) => ({
            ...item,
            id: `rec-${Math.random().toString(36).substr(2, 9)}`,
            read: false,
            applied: false,
            providerUsed: 'Groq (Qwen)',
            createdAt: new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.warn('Groq AI failed, trying Mistral AI...', e);
    }
  }

  // 2. Secondary: Mistral AI
  if (MISTRAL_API_KEY) {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJson(content));
          return parsed.map((item: any) => ({
            ...item,
            id: `rec-${Math.random().toString(36).substr(2, 9)}`,
            read: false,
            applied: false,
            providerUsed: 'Mistral AI',
            createdAt: new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.warn('Mistral AI failed, trying Google Gemini...', e);
    }
  }

  // 3. Tertiary: Google Gemini
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(cleanJson(content));
          return parsed.map((item: any) => ({
            ...item,
            id: `rec-${Math.random().toString(36).substr(2, 9)}`,
            read: false,
            applied: false,
            providerUsed: 'Google Gemini',
            createdAt: new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.warn('Google Gemini failed:', e);
    }
  }

  throw new Error('All AI Cloud Providers (Groq, Mistral, Gemini) failed to respond. Please verify your API keys.');
}
