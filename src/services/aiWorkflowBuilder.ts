export interface AIWorkflowResult {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];
  description: string;
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

export async function buildWorkflowFromPrompt(prompt: string): Promise<AIWorkflowResult> {
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
      type: index === 0 ? 'triggerNode' : 'workflowNode',
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
    description: `AI-generated from prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`
  };
}
