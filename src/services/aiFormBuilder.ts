// AA2000 Connect — AI Form Builder Service
// Groq → Mistral → Gemini fallback chain

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIGeneratedField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'file' | 'rating';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
}

export interface AIGeneratedForm {
  name: string;
  description: string;
  category: string;
  confirmationMessage: string;
  fields: AIGeneratedField[];
}

export interface AISubmissionAnalysis {
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'hot' | 'warm' | 'cold';
  summary: string;
  tags: string[];
  followUpSuggestion: string;
}

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'qwen-3.6-27b',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) return text;
      }
    } catch (e) { console.warn('Groq failed:', e); }
  }

  if (MISTRAL_API_KEY) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MISTRAL_API_KEY}` },
        body: JSON.stringify({
          model: 'open-mistral-7b',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) return text;
      }
    } catch (e) { console.warn('Mistral failed:', e); }
  }

  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }] }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return text;
      }
    } catch (e) { console.warn('Gemini failed:', e); }
  }

  return '';
}

// ── Form Builder System Prompt ─────────────────────────────────────────────────

const FORM_BUILDER_SYSTEM = `You are an expert web form designer for AA2000 Security & Technology Solutions Inc., Philippines.
AA2000 specializes in fire protection (FDAS), security (CCTV, access control), solar power, and network integration systems.
Given a user's request, produce a complete, ready-to-use web form definition as raw JSON (no markdown, no extra text).

Output a JSON object with this exact shape:
{
  "name": "string",
  "description": "string",
  "category": "Lead Capture | Product Inquiry | Service Request | FDAS Inquiry | Survey | Support",
  "confirmationMessage": "string",
  "fields": [{
    "key": "snake_case",
    "label": "Human Readable",
    "type": "text|email|tel|textarea|select|radio|checkbox|date|number|file|rating",
    "required": boolean,
    "placeholder": "optional string",
    "options": ["optional","array","for select/radio/checkbox"],
    "validation": "optional hint"
  }]
}

Rules:
- Always start with full_name (text, required), email (email, required), phone (tel, required)
- Add industry-relevant fields based on context
- FDAS/fire: building_type (select), floor_area_sqm (number), number_of_floors (number), existing_system (radio)
- Security: property_type (select), interested_in (checkbox multi), coverage_area (number)
- Solar: monthly_bill (number), roof_type (select), property_size (number)
- Always end with a message (textarea, not required) field
- Use select/radio where options are finite
- confirmationMessage must mention AA2000 and "within 24 hours"
- Output ONLY raw JSON, nothing else.`;

function localFormFallback(prompt: string): AIGeneratedForm {
  const lower = prompt.toLowerCase();
  const isFDAS = lower.includes('fdas') || lower.includes('fire') || lower.includes('alarm');
  const isSecurity = lower.includes('security') || lower.includes('cctv') || lower.includes('access control');
  const isSolar = lower.includes('solar') || lower.includes('power') || lower.includes('energy');
  const isSurvey = lower.includes('survey') || lower.includes('feedback') || lower.includes('satisfaction');
  const isSupport = lower.includes('support') || lower.includes('complaint') || lower.includes('service request');

  const baseFields: AIGeneratedField[] = [
    { key: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Juan dela Cruz' },
    { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'juan@company.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+63 9XX XXX XXXX' },
    { key: 'company', label: 'Company / Organization', type: 'text', required: false, placeholder: 'Your company name' },
  ];

  let extraFields: AIGeneratedField[] = [];
  let name = 'General Inquiry Form';
  let description = 'General inquiry form for AA2000 Connect products and services.';
  let category = 'Lead Capture';

  if (isFDAS) {
    name = 'FDAS Installation Inquiry';
    description = 'Collect client details for fire detection and alarm system (FDAS) installation inquiries.';
    category = 'FDAS Inquiry';
    extraFields = [
      { key: 'building_type', label: 'Building Type', type: 'select', required: true, options: ['Commercial', 'Residential', 'Industrial', 'Government', 'Hospital', 'School', 'Hotel', 'Mall'] },
      { key: 'floor_area_sqm', label: 'Approximate Floor Area (sqm)', type: 'number', required: false, placeholder: '500' },
      { key: 'number_of_floors', label: 'Number of Floors', type: 'number', required: false, placeholder: '3' },
      { key: 'existing_system', label: 'Existing Fire System?', type: 'radio', required: true, options: ['None', 'Partial (needs upgrade)', 'Yes (full replacement needed)'] },
      { key: 'preferred_schedule', label: 'Preferred Site Visit Date', type: 'date', required: false },
      { key: 'urgency', label: 'Project Urgency', type: 'select', required: false, options: ['Immediate (within 1 month)', 'Soon (1-3 months)', 'Planning stage (3-6 months)', 'Just inquiring'] },
      { key: 'message', label: 'Additional Details', type: 'textarea', required: false, placeholder: 'Describe your project or specific requirements...' },
    ];
  } else if (isSecurity) {
    name = 'Security System Inquiry';
    description = 'Collect details for CCTV, access control, and integrated security system proposals.';
    category = 'Product Inquiry';
    extraFields = [
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['Office', 'Warehouse', 'Retail Store', 'Residential', 'School', 'Hospital', 'Industrial Compound'] },
      { key: 'interested_in', label: 'System(s) of Interest', type: 'checkbox', required: true, options: ['CCTV Surveillance', 'Access Control', 'Intercom System', 'Intrusion Alarm', 'Integrated All-in-One'] },
      { key: 'coverage_area', label: 'Coverage Area (sqm)', type: 'number', required: false, placeholder: '200' },
      { key: 'existing_cctv', label: 'Existing Security System?', type: 'radio', required: false, options: ['None', 'Yes (needs upgrade)', 'Yes (needs maintenance)'] },
      { key: 'message', label: 'Specific Requirements', type: 'textarea', required: false, placeholder: 'Any special requirements or questions...' },
    ];
  } else if (isSolar) {
    name = 'Solar Power Inquiry';
    description = 'Collect client energy profile details for solar installation proposals.';
    category = 'Product Inquiry';
    extraFields = [
      { key: 'monthly_bill', label: 'Average Monthly Electric Bill (₱)', type: 'number', required: true, placeholder: '8000' },
      { key: 'roof_type', label: 'Roof Type', type: 'select', required: true, options: ['Concrete / Flat', 'Metal Sheet', 'Asphalt Shingles', 'Others'] },
      { key: 'property_size', label: 'Property Size (sqm)', type: 'number', required: false, placeholder: '300' },
      { key: 'grid_connection', label: 'Grid Connection Type', type: 'radio', required: false, options: ['Meralco', 'Other Electric Cooperative', 'Off-Grid'] },
      { key: 'message', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any other details about your energy needs...' },
    ];
  } else if (isSurvey) {
    name = 'Customer Satisfaction Survey';
    description = 'Collect feedback from existing clients about AA2000 products and services.';
    category = 'Survey';
    extraFields = [
      { key: 'service_type', label: 'Service Received', type: 'select', required: true, options: ['FDAS Installation', 'CCTV / Security', 'Solar Power', 'Network Setup', 'Maintenance'] },
      { key: 'overall_rating', label: 'Overall Satisfaction', type: 'rating', required: true },
      { key: 'would_recommend', label: 'Would you recommend AA2000?', type: 'radio', required: true, options: ['Definitely Yes', 'Probably Yes', 'Neutral', 'Probably Not', 'Definitely Not'] },
      { key: 'best_aspect', label: 'What did we do best?', type: 'select', required: false, options: ['Product Quality', 'Installation Team', 'Customer Service', 'Price / Value', 'Speed of Delivery'] },
      { key: 'message', label: 'Comments & Suggestions', type: 'textarea', required: false, placeholder: 'Please share your experience...' },
    ];
  } else if (isSupport) {
    name = 'Service Support Request';
    description = 'Submit service issues, complaints, or maintenance requests for existing AA2000 installations.';
    category = 'Support';
    extraFields = [
      { key: 'system_type', label: 'System Type', type: 'select', required: true, options: ['FDAS / Fire Alarm', 'CCTV / Security', 'Access Control', 'Solar', 'Network', 'Other'] },
      { key: 'issue_type', label: 'Issue Type', type: 'select', required: true, options: ['Equipment Malfunction', 'False Alarm', 'Software Error', 'Preventive Maintenance Request', 'Expansion / Add-on', 'Other'] },
      { key: 'urgency_level', label: 'Urgency Level', type: 'radio', required: true, options: ['Critical (system is down)', 'High (partial failure)', 'Normal (scheduled)', 'Low (inquiry only)'] },
      { key: 'best_contact_time', label: 'Best Time to Contact', type: 'select', required: false, options: ['Morning (8AM-12PM)', 'Afternoon (1PM-5PM)', 'Evening (5PM-8PM)', 'Anytime'] },
      { key: 'message', label: 'Issue Description', type: 'textarea', required: true, placeholder: 'Please describe the problem in detail...' },
    ];
  } else {
    extraFields = [
      { key: 'product_interest', label: 'Product / Service of Interest', type: 'select', required: true, options: ['FDAS / Fire Alarm', 'CCTV & Security', 'Access Control', 'Solar Power', 'Network Infrastructure', 'Other'] },
      { key: 'project_stage', label: 'Project Stage', type: 'select', required: false, options: ['Just exploring options', 'Ready to get a quote', 'Comparing suppliers', 'Ready to proceed'] },
      { key: 'heard_from', label: 'How Did You Hear About Us?', type: 'select', required: false, options: ['Google Search', 'Facebook', 'Referral', 'PhilGEPS', 'Trade Show / Exhibit', 'Other'] },
      { key: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us more about your project...' },
    ];
  }

  return {
    name,
    description,
    category,
    confirmationMessage: 'Thank you for your inquiry! An AA2000 specialist will reach out to you within 24 hours.',
    fields: [...baseFields, ...extraFields],
  };
}

export async function buildFormFromPrompt(prompt: string): Promise<AIGeneratedForm> {
  if (!GROQ_API_KEY && !MISTRAL_API_KEY && !GEMINI_API_KEY) {
    return localFormFallback(prompt);
  }

  const responseText = await callAI(FORM_BUILDER_SYSTEM, `Create a web form for: "${prompt}"`);

  if (responseText) {
    try {
      const parsed = JSON.parse(cleanJson(responseText));
      if (parsed && parsed.name && Array.isArray(parsed.fields) && parsed.fields.length > 0) {
        return parsed as AIGeneratedForm;
      }
    } catch (e) {
      console.error('Failed to parse AI form JSON:', e);
    }
  }

  return localFormFallback(prompt);
}

// ── Submission Analyzer ───────────────────────────────────────────────────────

const ANALYZER_SYSTEM = `You are an expert CRM lead analyst for AA2000 Security & Technology Solutions Inc., Philippines.
Given a web form submission, analyze the prospect and return a structured JSON analysis.

Output a JSON object (no markdown, no extra text):
{
  "score": number,
  "sentiment": "positive" | "neutral" | "negative",
  "priority": "hot" | "warm" | "cold",
  "summary": "2-3 sentence prospect summary",
  "tags": ["tag1", "tag2", "tag3"],
  "followUpSuggestion": "recommended next action"
}

Scoring:
- 80-100: Commercial/industrial, large project, urgent, detailed → hot
- 50-79: Mid-size, moderately detailed → warm
- 0-49: Residential only, vague, or incomplete → cold`;

function localAnalysisFallback(formName: string, data: Record<string, unknown>): AISubmissionAnalysis {
  const hasCompany = !!(data.company || data.company_name);
  const hasMessage = !!(data.message && String(data.message).length > 20);
  const building = data.building_type as string | undefined;
  const isCommercial = building && ['Commercial', 'Industrial', 'Government', 'Hospital', 'Hotel', 'Mall'].includes(building);
  const urgency = String(data.urgency || data.urgency_level || '').toLowerCase();
  const isUrgent = urgency.includes('immediate') || urgency.includes('critical') || urgency.includes('soon');

  let score = 35;
  if (hasCompany) score += 20;
  if (hasMessage) score += 15;
  if (isCommercial) score += 20;
  if (isUrgent) score += 15;
  if (data.floor_area_sqm && Number(data.floor_area_sqm) > 500) score += 10;
  if (data.monthly_bill && Number(data.monthly_bill) > 10000) score += 10;
  score = Math.min(score, 98);

  const priority: 'hot' | 'warm' | 'cold' = score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold';
  const sentiment: 'positive' | 'neutral' | 'negative' = hasMessage ? 'positive' : 'neutral';
  const name = (data.full_name || data.name || 'Prospect') as string;
  const co = data.company ? ` from ${data.company}` : '';

  const tags: string[] = [
    priority === 'hot' ? 'High Priority' : priority === 'warm' ? 'Follow Up' : 'Low Priority',
    hasCompany ? 'Corporate' : 'Individual',
    formName,
    'Web Form Lead',
  ];
  if (isUrgent) tags.push('Urgent');

  return {
    score,
    sentiment,
    priority,
    summary: `${name}${co} submitted an inquiry via "${formName}". ${hasMessage ? `They provided detailed requirements: "${String(data.message).substring(0, 80)}..."` : 'Limited details were provided.'} ${hasCompany ? 'This appears to be a corporate lead.' : 'This is an individual inquiry.'}`,
    tags,
    followUpSuggestion: priority === 'hot'
      ? 'Call within 2 hours. Prepare a formal quotation and schedule a site visit immediately.'
      : priority === 'warm'
      ? 'Send a follow-up email within 24 hours with a product brochure. Schedule a discovery call.'
      : 'Add to email nurture sequence. Follow up within 3-5 business days.',
  };
}

export async function analyzeFormSubmission(
  formName: string,
  data: Record<string, unknown>
): Promise<AISubmissionAnalysis> {
  const dataStr = Object.entries(data)
    .map(([k, v]) => `${k.replace(/_/g, ' ').toUpperCase()}: ${v}`)
    .join('\n');

  const userPrompt = `Form: "${formName}"\n\nSubmission:\n${dataStr}`;
  const responseText = await callAI(ANALYZER_SYSTEM, userPrompt);

  if (responseText) {
    try {
      const parsed = JSON.parse(cleanJson(responseText));
      if (parsed && typeof parsed.score === 'number') {
        return parsed as AISubmissionAnalysis;
      }
    } catch (e) {
      console.error('Failed to parse AI analysis:', e);
    }
  }

  return localAnalysisFallback(formName, data);
}
