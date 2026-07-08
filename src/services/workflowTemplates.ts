export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_capture' | 'follow_up' | 'notification' | 'deal_management' | 'meeting' | 'engagement';
  icon: string;
  popularity: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];
}

const SALES_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-new-lead',
    name: 'New Lead Alert',
    description: 'Get notified immediately when a new lead is captured from any channel — website, Facebook, or Messenger.',
    category: 'lead_capture',
    icon: 'Bell',
    popularity: 95,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'New Lead Created', triggerEvent: 'Contact Created' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Notify Assigned Rep', type: 'action', iconType: 'notify', description: 'Send in-app notification to the assigned sales rep.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Send Welcome Message', type: 'action', iconType: 'email', description: 'Auto-send a welcome message to the new lead.' }, position: { x: 250, y: 340 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true }
    ]
  },
  {
    id: 'tpl-followup-reminder',
    name: 'Follow-up Reminder',
    description: 'Remind you to follow up with a lead who hasn\'t been contacted in 3 days.',
    category: 'follow_up',
    icon: 'Clock',
    popularity: 90,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Inactivity Detected', triggerEvent: 'Custom Webhook' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'conditionNode', data: { label: 'Last Activity > 3 Days?', type: 'condition', iconType: 'condition' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Push Notification to Rep', type: 'action', iconType: 'notify', description: 'Ping the rep to follow up.' }, position: { x: 100, y: 340 } },
      { id: 'n-3', type: 'workflowNode', data: { label: 'Create Follow-up Task', type: 'action', iconType: 'task', description: 'Add a task: "Follow up with [lead name]"' }, position: { x: 400, y: 340 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true },
      { id: 'e-3', source: 'n-1', target: 'n-3', animated: true }
    ]
  },
  {
    id: 'tpl-deal-won',
    name: 'Deal Won Celebration',
    description: 'When a deal is marked as Won, notify the team and send a thank-you to the client.',
    category: 'deal_management',
    icon: 'Trophy',
    popularity: 85,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Deal Won', triggerEvent: 'Deal Won' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Notify Sales Team', type: 'action', iconType: 'notify', description: 'Celebrate with the team.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Send Thank-You Email', type: 'action', iconType: 'email', description: 'Auto-send a thank-you message.' }, position: { x: 250, y: 340 } },
      { id: 'n-3', type: 'workflowNode', data: { label: 'Create Onboarding Task', type: 'action', iconType: 'task', description: 'Kick off the onboarding process.' }, position: { x: 250, y: 500 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true },
      { id: 'e-3', source: 'n-2', target: 'n-3', animated: true }
    ]
  },
  {
    id: 'tpl-quotation-followup',
    name: 'Quotation Sent Follow-up',
    description: 'Automatically follow up with a client 2 days after a quotation is sent if no response is received.',
    category: 'follow_up',
    icon: 'FileText',
    popularity: 88,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Quotation Sent', triggerEvent: 'Deal Created' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Wait 2 Days', type: 'action', iconType: 'wait', description: 'Delay before follow-up.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Send Follow-up Email', type: 'action', iconType: 'email', description: '"Just checking in on the quotation..."' }, position: { x: 250, y: 340 } },
      { id: 'n-3', type: 'workflowNode', data: { label: 'Notify Rep if No Reply', type: 'action', iconType: 'notify', description: 'Alert rep to call personally.' }, position: { x: 250, y: 500 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true },
      { id: 'e-3', source: 'n-2', target: 'n-3', animated: true }
    ]
  },
  {
    id: 'tpl-meeting-followup',
    name: 'Meeting Follow-up',
    description: 'Send a thank-you message and meeting summary request after a meeting is scheduled or completed.',
    category: 'meeting',
    icon: 'CalendarCheck',
    popularity: 82,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Meeting Completed', triggerEvent: 'Appointment Scheduled' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Send Thank-You Message', type: 'action', iconType: 'email', description: 'Auto thank-you + next steps.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Create Follow-up Task', type: 'action', iconType: 'task', description: 'Remind rep to call in 1 week.' }, position: { x: 250, y: 340 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true }
    ]
  },
  {
    id: 'tpl-lead-reassign',
    name: 'Lead Reassignment Alert',
    description: 'Notify a sales rep immediately when a lead is reassigned to them.',
    category: 'notification',
    icon: 'UserPlus',
    popularity: 75,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Lead Reassigned', triggerEvent: 'Contact Field Changed' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Notify New Rep', type: 'action', iconType: 'notify', description: 'You have a new lead assigned.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Send Lead Summary', type: 'action', iconType: 'email', description: 'Email the lead details to the rep.' }, position: { x: 250, y: 340 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true }
    ]
  },
  {
    id: 'tpl-birthday-greeting',
    name: 'Birthday Greeting',
    description: 'Auto-send a personalized birthday message to your contacts on their special day.',
    category: 'engagement',
    icon: 'Gift',
    popularity: 70,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Recurring Schedule', triggerEvent: 'Custom Webhook' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Check Today\'s Birthdays', type: 'action', iconType: 'search', description: 'Find contacts with birthday today.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'workflowNode', data: { label: 'Send Birthday Email', type: 'action', iconType: 'email', description: '"Happy Birthday! Here\'s a special offer..."' }, position: { x: 250, y: 340 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true }
    ]
  },
  {
    id: 'tpl-deal-lost',
    name: 'Deal Lost Analysis',
    description: 'When a deal is lost, log the reason and create a re-engagement task for the future.',
    category: 'deal_management',
    icon: 'TrendingDown',
    popularity: 78,
    nodes: [
      { id: 'trigger-1', type: 'triggerNode', data: { label: 'Deal Lost', triggerEvent: 'Deal Lost' }, position: { x: 250, y: 20 } },
      { id: 'n-1', type: 'workflowNode', data: { label: 'Log Loss Reason', type: 'action', iconType: 'note', description: 'Record why the deal was lost.' }, position: { x: 250, y: 180 } },
      { id: 'n-2', type: 'conditionNode', data: { label: 'Set Re-engage Date?', type: 'condition', iconType: 'condition' }, position: { x: 250, y: 340 } },
      { id: 'n-3', type: 'workflowNode', data: { label: 'Create Re-engagement Task', type: 'action', iconType: 'task', description: 'Follow up in 3 months.' }, position: { x: 250, y: 500 } }
    ],
    edges: [
      { id: 'e-1', source: 'trigger-1', target: 'n-1', animated: true },
      { id: 'e-2', source: 'n-1', target: 'n-2', animated: true },
      { id: 'e-3', source: 'n-2', target: 'n-3', animated: true }
    ]
  }
];

export function getTemplates(): WorkflowTemplate[] {
  return SALES_TEMPLATES;
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return SALES_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return SALES_TEMPLATES.filter(t => t.category === category);
}
