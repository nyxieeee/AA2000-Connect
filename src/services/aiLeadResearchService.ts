// AA2000 Connect — AI Lead Research & Enrichment Service
// Multi-Provider Cloud AI (Groq -> Mistral -> Gemini)

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AILeadResearchResult {
  companyIndustry: string;
  estimatedCompanySize: string;
  technicalNeeds: string[];
  qualificationScore: number;
  qualificationReason: string;
  suggestedTalkingPoints: string[];
  providerUsed: 'Groq (Qwen)' | 'Mistral AI' | 'Google Gemini';
  researchedAt: string;
}

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function researchAndEnrichLead(lead: {
  name: string;
  email: string;
  company?: string;
  notes?: string;
  source: string;
}): Promise<AILeadResearchResult> {
  const prompt = `You are AA2000 Connect's AI Lead Intelligence Researcher for Philippine enterprise security, fire safety, and CCTV systems.
Analyze the following lead profile and provide structured market intelligence.

Lead Details:
- Contact Name: ${lead.name}
- Email: ${lead.email}
- Company Name: ${lead.company || 'Not Specified'}
- Channel Source: ${lead.source}
- Initial Inquiry Notes: ${lead.notes || 'No initial notes'}

Respond with ONLY valid raw JSON matching this schema exactly (no markdown formatting, no commentary):
{
  "companyIndustry": "e.g. Commercial Real Estate & Property Management",
  "estimatedCompanySize": "e.g. 50-200 Employees",
  "technicalNeeds": ["BFP Compliant Smoke Detectors", "IP CCTV Surveillance", "Biometric Access Control"],
  "qualificationScore": 85,
  "qualificationReason": "High intent commercial inquiry with active project timeline and verified company profile.",
  "suggestedTalkingPoints": [
    "Highlight AA2000's 20+ years expertise in BFP-compliant commercial fire safety audits.",
    "Offer turn-key supply & installation warranty package.",
    "Propose a complimentary site inspection with our senior project engineering team."
  ]
}`;

  // 1. Primary Provider: Groq (Qwen / GPT-OSS)
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
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJson(content));
          return {
            ...parsed,
            providerUsed: 'Groq (Qwen)',
            researchedAt: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('Groq AI failed, trying Mistral AI...', e);
    }
  }

  // 2. Secondary Provider: Mistral AI
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
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJson(content));
          return {
            ...parsed,
            providerUsed: 'Mistral AI',
            researchedAt: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('Mistral AI failed, trying Google Gemini...', e);
    }
  }

  // 3. Tertiary Provider: Google Gemini
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
          return {
            ...parsed,
            providerUsed: 'Google Gemini',
            researchedAt: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('Google Gemini failed:', e);
    }
  }

  throw new Error('All AI Cloud Providers (Groq, Mistral, Gemini) failed to respond. Please check your API keys.');
}
