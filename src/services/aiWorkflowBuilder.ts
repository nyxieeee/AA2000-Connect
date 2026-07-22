export interface AIWorkflowResult {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];
  description: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function extractTrigger(prompt: string): { triggerEvent: string; label: string } {
  const lower = prompt.toLowerCase();

  if (lower.includes('facebook') || lower.includes('messenger')) {
    return { triggerEvent: 'Social Media Message', label: 'Facebook/Messenger Message Received' };
  }
  if (lower.includes('viber')) {
    return { triggerEvent: 'Social Media Message', label: 'Viber Message Received' };
  }
  if (lower.includes('email') && (lower.includes('inquiry') || lower.includes('received'))) {
    return { triggerEvent: 'Email Opened', label: 'Email Inquiry Received' };
  }
  if (lower.includes('form') || lower.includes('website')) {
    return { triggerEvent: 'Form Submitted', label: 'Website Form Submitted' };
  }
  if (lower.includes('deal') && lower.includes('won')) {
    return { triggerEvent: 'Deal Won', label: 'Deal Won' };
  }
  if (lower.includes('deal') && lower.includes('lost')) {
    return { triggerEvent: 'Deal Lost', label: 'Deal Lost' };
  }
  if (lower.includes('lead') && (lower.includes('new') || lower.includes('created'))) {
    return { triggerEvent: 'Contact Created', label: 'New Lead Created' };
  }
  if (lower.includes('inactive') || lower.includes('no activity') || lower.includes('quiet')) {
    return { triggerEvent: 'Custom Webhook', label: 'Inactivity Detected' };
  }
  if (lower.includes('task') || lower.includes('follow up') || lower.includes('remind')) {
    return { triggerEvent: 'Task Completed', label: 'Follow-up Trigger' };
  }
  return { triggerEvent: 'Contact Created', label: 'Lead/Contact Created' };
}

function extractActions(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const actions: string[] = [];

  if (lower.includes('email') || lower.includes('send message') || lower.includes('send email')) {
    actions.push('email');
  }
  if (lower.includes('notify') || lower.includes('alert') || lower.includes('notification')) {
    actions.push('notify');
  }
  if (lower.includes('task') || lower.includes('create task') || lower.includes('to-do')) {
    actions.push('task');
  }
  if (lower.includes('assign') || lower.includes('reassign')) {
    actions.push('assign');
  }
  if (lower.includes('tag') || lower.includes('label')) {
    actions.push('tag');
  }
  if (lower.includes('update deal') || lower.includes('move deal') || lower.includes('change stage')) {
    actions.push('update_deal');
  }
  if (lower.includes('wait') || lower.includes('delay') || lower.includes('days') || lower.includes('hours')) {
    actions.push('wait');
  }

  if (actions.length === 0) {
    actions.push('notify');
  }

  return actions;
}

function extractWaitingPeriod(prompt: string): number | null {
  const patterns = [
    { regex: /(\d+)\s*day/i, multiplier: 1 },
    { regex: /(\d+)\s*hour/i, multiplier: 1 / 24 },
    { regex: /(\d+)\s*week/i, multiplier: 7 },
  ];

  for (const { regex, multiplier } of patterns) {
    const match = prompt.match(regex);
    if (match) {
      return Math.round(parseInt(match[1]) * multiplier);
    }
  }

  if (prompt.toLowerCase().includes('follow up') || prompt.toLowerCase().includes('followup')) {
    return 3;
  }

  return null;
}

function generateName(prompt: string): string {
  const sentences = prompt.split(/[.!?\n]/).filter(s => s.trim().length > 10);
  if (sentences.length > 0) {
    const first = sentences[0].trim();
    return first.length > 60 ? first.substring(0, 57) + '...' : first;
  }
  return 'AI Generated Workflow';
}

const ACTION_CONFIGS: Record<string, { label: string; iconType: string; description: string }> = {
  email: { label: 'Send Email', iconType: 'email', description: 'Send an automated email to the contact.' },
  notify: { label: 'Push Notification', iconType: 'notify', description: 'Send an in-app notification to the assigned rep.' },
  task: { label: 'Create Task', iconType: 'task', description: 'Create a follow-up task for the assigned rep.' },
  assign: { label: 'Assign Lead', iconType: 'contact', description: 'Auto-assign the lead to a rep based on rules.' },
  tag: { label: 'Add Tag', iconType: 'tag', description: 'Tag the contact for segmentation.' },
  update_deal: { label: 'Update Deal Stage', iconType: 'deal', description: 'Move the deal to a different pipeline stage.' },
  wait: { label: 'Wait for Period', iconType: 'wait', description: 'Delay before the next action.' },
};

function localFallbackBuilder(prompt: string): AIWorkflowResult {
  const trigger = extractTrigger(prompt);
  const actionTypes = extractActions(prompt);
  const waitDays = extractWaitingPeriod(prompt);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges: any[] = [];

  let y = 20;
  const x = 250;
  const spacing = 160;

  const triggerNode = {
    id: 'trigger-1',
    type: 'triggerNode',
    data: { label: trigger.label, triggerEvent: trigger.triggerEvent },
    position: { x, y }
  };
  nodes.push(triggerNode);
  y += spacing;

  let prevId = 'trigger-1';

  if (waitDays) {
    const waitNode = {
      id: `n-wait`,
      type: 'workflowNode',
      data: {
        label: `Wait ${waitDays} Day${waitDays > 1 ? 's' : ''}`,
        type: 'action',
        iconType: 'wait',
        description: `Delay for ${waitDays} day${waitDays > 1 ? 's' : ''} before proceeding.`
      },
      position: { x, y }
    };
    nodes.push(waitNode);
    edges.push({ id: `e-${prevId}-wait`, source: prevId, target: `n-wait`, animated: true });
    prevId = 'n-wait';
    y += spacing;
  }

  actionTypes.forEach((type, index) => {
    const config = ACTION_CONFIGS[type];
    if (!config) return;

    const actionId = `n-${index}`;
    const actionNode = {
      id: actionId,
      type: 'workflowNode',
      data: {
        label: config.label,
        type: 'action',
        iconType: config.iconType,
        description: config.description
      },
      position: { x, y }
    };
    nodes.push(actionNode);
    edges.push({ id: `e-${prevId}-${actionId}`, source: prevId, target: actionId, animated: true });
    prevId = actionId;
    y += spacing;
  });

  return {
    name: generateName(prompt),
    nodes,
    edges,
    description: `AI-generated (local heuristic) from prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`
  };
}

export async function buildWorkflowFromPrompt(prompt: string): Promise<AIWorkflowResult> {
  // If no keys are present, skip remote call and use local generator
  if (!GROQ_API_KEY && !MISTRAL_API_KEY && !GEMINI_API_KEY) {
    return localFallbackBuilder(prompt);
  }

  const systemPrompt = `You are an expert AI system integration and workflow automation builder for AA2000 Security & Technology Solutions Inc., Philippines.
AA2000 specializes in fire protection (FDAS), security (CCTV, Access Control), solar, and network integrations.
Analyze the user's workflow automation request and construct a complete, functional graph of trigger and action nodes.

The output MUST be a valid JSON object matching the following TypeScript interface:
interface AIWorkflowResult {
  name: string;
  nodes: Array<{
    id: string;
    type: 'triggerNode' | 'workflowNode' | 'conditionNode';
    data: {
      label: string;
      type: 'trigger' | 'action' | 'condition';
      iconType?: 'trigger' | 'email' | 'sms' | 'contact' | 'wait' | 'condition' | 'notify' | 'action';
      description?: string;
    };
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated: boolean;
  }>;
  description: string;
}

Constraints:
1. First node in 'nodes' must be a 'triggerNode' with id: 'trigger-1' and data.type: 'trigger'.
2. Nodes should follow a sequential layout (e.g. position.x: 250, position.y increments by 160 for each step).
3. Connect parent to child using 'edges' with animated: true.
4. If a condition (e.g. If/Else) is required, use type: 'conditionNode', and specify appropriate output edge connections.
5. Provide a professional, concise workflow name and clear descriptions.
6. The JSON output must be clean and not wrapped in markdown code blocks. Output ONLY the raw JSON string. Do not include any explanations or conversational text.`;

  const userPrompt = `Build workflow for prompt: "${prompt}"`;

  let responseText = '';
  let success = false;

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
          model: 'qwen-3.6-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || '';
        if (responseText) success = true;
      }
    } catch (e) {
      console.error('Groq builder failed, trying Mistral:', e);
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
          ],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || '';
        if (responseText) success = true;
      }
    } catch (e) {
      console.error('Mistral builder failed, trying Gemini:', e);
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
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (responseText) success = true;
      }
    } catch (e) {
      console.error('Gemini builder failed:', e);
    }
  }

  if (success && responseText) {
    try {
      const cleaned = cleanJsonResponse(responseText);
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        return parsed as AIWorkflowResult;
      }
    } catch (e) {
      console.error('Failed to parse AI response JSON:', e, responseText);
    }
  }

  // Fallback to local heuristic if anything goes wrong or if API keys are inactive
  return localFallbackBuilder(prompt);
}
