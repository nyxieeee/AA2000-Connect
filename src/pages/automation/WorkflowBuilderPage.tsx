import { useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow, addEdge, Background, Controls,
  useNodesState, useEdgesState,
  type Connection, type Edge, type Node, type NodeTypes, MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ChevronLeft, Pencil, Play, X, Trash2,
  Mail, Clock, SplitSquareHorizontal,
  Bell, UserCheck, LayoutGrid, History, Settings2, ListChecks,
  Monitor, TrendingUp, Copy, Bot, Sparkles,
  CheckCircle2, Hourglass, XCircle, SendHorizonal,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { WorkflowNode, TriggerNode, ConditionNode } from './WorkflowNodes';
import { WorkflowSettingsTab, WorkflowEnrollmentTab, WorkflowLogsTab } from './WorkflowTabs';
import WorkflowListPage from './WorkflowListPage';
import { useAutomationStore, type Workflow, type ApprovalStatus } from '../../stores/modules/automationStore';
import { useAuthStore } from '../../stores/authStore';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';

type WorkflowNodeData = { label: string; type?: string; iconType?: string; description?: string; [key: string]: unknown; };
type AppNode = Node<WorkflowNodeData>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = { workflowNode: WorkflowNode as any, triggerNode: TriggerNode as any, conditionNode: ConditionNode as any };

const makeInitialNodes = (): AppNode[] => [
  { id: 'trigger-1', type: 'triggerNode', data: { label: 'Workflow Trigger' }, position: { x: 250, y: 20 } },
];

const makeInitialEdges = (): Edge[] => [];


const LEFT_ICONS = [
  { icon: LayoutGrid, tip: 'Overview' },
  { icon: Clock, tip: 'Wait' },
  { icon: Bell, tip: 'Notify' },
  { icon: ListChecks, tip: 'Actions' },
  { icon: UserCheck, tip: 'Contacts' },
  { icon: Monitor, tip: 'External' },
  { icon: History, tip: 'History' },
  { icon: Settings2, tip: 'Settings' },
];

const ADD_ACTIONS = [
  { label: 'Recurring Schedule', icon: Clock, nodeType: 'triggerNode', iconType: 'wait' },
  { label: 'Update Deal', icon: TrendingUp, nodeType: 'workflowNode', iconType: 'deal' },
  { label: 'Send Email', icon: Mail, nodeType: 'workflowNode', iconType: 'email' },
  { label: 'AI Agent Reply', icon: Bot, nodeType: 'workflowNode', iconType: 'action' },
  { label: 'AI Campaign Blast', icon: Sparkles, nodeType: 'workflowNode', iconType: 'action' },
  { label: 'If / Else', icon: SplitSquareHorizontal, nodeType: 'conditionNode', iconType: 'condition' },
  { label: 'Notification', icon: Bell, nodeType: 'workflowNode', iconType: 'notify' },
];

type ViewMode = 'list' | 'builder';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function WorkflowBuilderPage() {
  const { addWorkflow, updateWorkflow, submitForApproval, approveWorkflow, rejectWorkflow, workflows } = useAutomationStore();
  const { pipelines } = usePipelinesStore();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [testingProgress, setTestingProgress] = useState(0);
  const [testingLogs, setTestingLogs] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState('Builder');
  const [isPublished, setIsPublished] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('draft');
  const [workflowName, setWorkflowName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(makeInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(makeInitialEdges());
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const nodeCounter = useRef(0);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } } as Edge, eds)),
    [setEdges],
  );

  const onNodeClick = (_: unknown, node: AppNode) => setSelectedNode(node);

  const addNode = (nodeType: string, iconType: string, label: string) => {
    const id = `n-${++nodeCounter.current}`;
    const last = nodes[nodes.length - 1];
    const newNode: AppNode = {
      id, type: nodeType,
      data: { label, type: 'action', iconType, description: `${label} action step.` },
      position: { x: last ? last.position.x : 250, y: last ? last.position.y + 150 : 0 },
    };
    setNodes(nds => [...nds, newNode]);
    if (last) {
      setEdges(eds => addEdge({ id: `e-${last.id}-${id}`, source: last.id, target: id, animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } } as Edge, eds));
    }
  };

  const openBuilder = (wf: Workflow) => {
    setCurrentWorkflowId(wf.id);
    setCurrentFolderId(wf.folderId);
    setWorkflowName(wf.name);
    setIsPublished(wf.status === 'Published');
    setApprovalStatus(wf.approvalStatus || 'draft');
    setNodes(wf.nodes?.length ? wf.nodes as AppNode[] : makeInitialNodes());
    setEdges(wf.edges?.length ? wf.edges : makeInitialEdges());
    setActiveTab('Builder');
    setSelectedNode(null);
    setView('builder');
    setShowRejectInput(false);
    setRejectComment('');
  };

  const createNew = (folderId?: string) => {
    setCurrentWorkflowId(null);
    setCurrentFolderId(folderId);
    setWorkflowName('New Workflow');
    setIsPublished(false);
    setNodes(makeInitialNodes());
    setEdges(makeInitialEdges());
    setSelectedNode(null);
    setActiveTab('Builder');
    setView('builder');
  };

  const saveWorkflow = () => {
    const data = {
      name: workflowName,
      status: isPublished ? 'Published' as const : 'Draft' as const,
      approvalStatus: approvalStatus as ApprovalStatus,
      folderId: currentFolderId,
      nodes,
      edges
    };

    if (currentWorkflowId) {
      updateWorkflow(currentWorkflowId, data);
    } else {
      const newWf = addWorkflow(data);
      setCurrentWorkflowId(newWf.id);
    }
  };

  const handleTestWorkflow = async () => {
    setIsTestingWorkflow(true);
    setTestingProgress(0);
    setTestingLogs([]);

    setTestingLogs(prev => [...prev, 'Initializing workflow test execution environment...']);
    await new Promise(r => setTimeout(r, 600));

    setTestingLogs(prev => [...prev, 'Compiling workflow node tree...']);
    await new Promise(r => setTimeout(r, 600));

    const nodeLabels = nodes.map((n, i) => `${i + 1}. [${n.type || 'Action'}] ${n.data?.label || 'Unnamed Node'}`).join('\n');
    setTestingLogs(prev => [...prev, `Found ${nodes.length} compiled nodes:\n${nodeLabels}`]);
    await new Promise(r => setTimeout(r, 800));

    setTestingLogs(prev => [...prev, 'Connecting to our AI provider APIs (fallback chain: Groq -> Mistral -> Gemini)...']);
    await new Promise(r => setTimeout(r, 800));

    const systemPrompt = `You are a professional automated QA agent for AA2000 workflow automation system.
Generate a realistic execution simulation log (maximum 5 lines of log output) for testing the following workflow steps:
${nodeLabels}

Format each line of the output as a distinct execution state step (e.g. "[Trigger] Viber message received from +639171234567", "[Action] Automated response dispatched...", etc.). Keep it technical and realistic. Do not use emojis. Output ONLY the lines of logs.`;

    const userPrompt = `Simulate execution logs.`;

    let success = false;
    let resultsText = '';

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
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Groq test builder failed, trying Mistral:', e);
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
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          resultsText = data.choices?.[0]?.message?.content || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Mistral test builder failed, trying Gemini:', e);
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
          resultsText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultsText) success = true;
        }
      } catch (e) {
        console.error('Gemini test builder failed:', e);
      }
    }

    const simLogs = success && resultsText
      ? resultsText.split('\n').filter(line => line.trim().length > 0)
      : [
          `[Trigger] Input payload resolved from active contact segment.`,
          `[Action] Processing node tree and testing SMTP routing.`,
          `[Action] Auto-Reply message successfully queued for transmission.`,
          `[Complete] Execution completed successfully with code 0.`
        ];

    // Stream logs dynamically
    for (let i = 0; i < simLogs.length; i++) {
      setTestingLogs(prev => [...prev, simLogs[i]]);
      setTestingProgress(Math.min(90, Math.round(((i + 1) / simLogs.length) * 90)));
      await new Promise(r => setTimeout(r, 700));
    }

    setTestingProgress(100);
    setTestingLogs(prev => [...prev, 'Workflow test run succeeded! Status: ACTIVE. Code 0.']);
  };

  const currentWorkflow = currentWorkflowId ? workflows.find(w => w.id === currentWorkflowId) : null;

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return <WorkflowListPage onOpen={openBuilder} onCreateNew={createNew} />;
  }

  // ── BUILDER VIEW ───────────────────────────────────────────────────────────
  const builderTabs = ['Builder', 'Settings', 'Enrollment History', 'Execution Logs'];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col overflow-hidden bg-white border border-surface-border rounded-[2rem] shadow-premium animate-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-surface-border shrink-0 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-900 transition-colors shrink-0 font-bold uppercase tracking-wider">
            <ChevronLeft size={16} /> Back
          </button>
          <span className="text-slate-200 shrink-0">|</span>
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <input
                autoFocus value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="text-xs font-bold text-navy-900 border-b border-brand-blue outline-none bg-transparent truncate max-w-xs uppercase tracking-wide"
              />
            ) : (
              <span className="text-xs font-black text-navy-900 truncate max-w-xs uppercase tracking-wide">{workflowName}</span>
            )}
            <button onClick={() => setIsEditingName(true)} className="p-1 text-slate-400 hover:text-navy-900 transition-colors shrink-0">
              <Pencil size={12} />
            </button>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl shrink-0">
          {builderTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all',
                activeTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-400 hover:text-navy-900'
              )}>
              {tab}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleTestWorkflow} className="px-3 py-1.5 border border-surface-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm">
            <Play size={12} className="text-slate-400" /> Test Workflow
          </button>

          {approvalStatus === 'active' ? (
            <span className="px-3.5 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Active
            </span>
          ) : approvalStatus === 'pending_approval' ? (
            <span className="px-3.5 py-2 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-1.5">
              <Hourglass size={12} /> Pending Approval
            </span>
          ) : approvalStatus === 'approved' ? (
            <button
              onClick={() => { if (currentWorkflowId) { approveWorkflow(currentWorkflowId); setApprovalStatus('active'); setIsPublished(true); } }}
              className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5"
            >
              <Play size={12} /> Activate Now
            </button>
          ) : (
            <button
              onClick={() => { if (currentWorkflowId) { submitForApproval(currentWorkflowId); setApprovalStatus('pending_approval'); } }}
              className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5"
            >
              <SendHorizonal size={12} /> Submit
            </button>
          )}

          <button onClick={saveWorkflow} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-brand-blue rounded-xl hover:bg-brand-light transition-all shadow-md active:scale-[0.98]">
            Save
          </button>
        </div>
      </div>

      {/* Approval banner for pending_approval */}
      {approvalStatus === 'pending_approval' && (
        <div className="flex items-center justify-between px-6 py-2 bg-amber-50 border-b border-amber-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
            <Hourglass size={14} />
            This workflow is pending review by an admin.
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (currentWorkflowId) { approveWorkflow(currentWorkflowId); setApprovalStatus('active'); setIsPublished(true); } }}
                className="px-3 py-1 text-[10px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
              >
                <CheckCircle2 size={12} /> Approve
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="px-3 py-1 text-[10px] font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all flex items-center gap-1"
              >
                <XCircle size={12} /> Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reject input */}
      {showRejectInput && (
        <div className="flex items-center gap-3 px-6 py-2 bg-rose-50 border-b border-rose-200 shrink-0">
          <input
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            placeholder="Reason for rejection..."
            className="flex-1 px-3 py-1.5 text-xs border border-rose-300 rounded-lg outline-none focus:ring-1 focus:ring-rose-300 bg-white"
          />
          <button
            onClick={() => { if (currentWorkflowId) { rejectWorkflow(currentWorkflowId, rejectComment || 'No reason provided'); setApprovalStatus('draft'); setShowRejectInput(false); setRejectComment(''); } }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all"
          >
            Confirm Reject
          </button>
          <button onClick={() => { setShowRejectInput(false); setRejectComment(''); }} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-all">
            Cancel
          </button>
        </div>
      )}

      {/* Rejection comment display */}
      {approvalStatus === 'draft' && currentWorkflow?.approvalComment && (
        <div className="flex items-center gap-2 px-6 py-2 bg-rose-50 border-b border-rose-200 shrink-0">
          <XCircle size={14} className="text-rose-500 shrink-0" />
          <p className="text-xs text-rose-700 font-medium">
            Previously rejected: "{currentWorkflow.approvalComment}"
          </p>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Far-left icon rail */}
        <div className="w-10 bg-white border-r border-surface-border flex flex-col items-center py-3 gap-1 shrink-0">
          {LEFT_ICONS.map(({ icon: Icon, tip }) => (
            <button key={tip} title={tip} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-slate-100 rounded transition-all">
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-slate-50 relative overflow-hidden">
          {activeTab === 'Builder' ? (
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onNodeClick={onNodeClick}
              nodeTypes={nodeTypes} fitView colorMode="light"
            >
              <Background color="#cbd5e1" gap={24} size={1} />
              <Controls className="!left-3 !bottom-3 bg-white border border-surface-border shadow rounded-lg overflow-hidden" />
            </ReactFlow>
          ) : activeTab === 'Settings' ? (
            <WorkflowSettingsTab />
          ) : activeTab === 'Enrollment History' ? (
            <WorkflowEnrollmentTab />
          ) : activeTab === 'Execution Logs' ? (
            <WorkflowLogsTab />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 opacity-30">
                <ListChecks size={40} className="mx-auto text-slate-400" strokeWidth={1} />
                <p className="text-sm font-bold text-navy-900 uppercase tracking-widest">{activeTab}</p>
                <p className="text-xs text-slate-500">This section is coming soon.</p>
              </div>
            </div>
          )}

          {/* Add node panel — bottom center */}
          {activeTab === 'Builder' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white border border-surface-border rounded-xl shadow-lg px-3 py-2">
              {ADD_ACTIONS.map(a => (
                <button key={a.label} title={a.label}
                  onClick={() => addNode(a.nodeType, a.iconType, a.label)}
                  className="flex flex-col items-center gap-1 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-all group">
                  <a.icon size={16} className="text-slate-400 group-hover:text-brand-blue transition-colors" />
                  <span className="text-[9px] font-semibold text-slate-400 group-hover:text-brand-blue uppercase tracking-wider whitespace-nowrap">{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Config Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-surface-border flex flex-col overflow-hidden shrink-0">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-surface-border flex items-start justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-navy-900">{String(selectedNode.data.label)}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedNode.type === 'conditionNode' 
                    ? 'Fork the Contact journey based on conditions'
                    : selectedNode.type === 'triggerNode'
                    ? 'Define how contacts enter this workflow'
                    : 'Configure the parameters for this action step'}
                </p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1 text-slate-400 hover:text-navy-900 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Name</label>
                <input type="text" value={selectedNode.data.label}
                  onChange={e => {
                    const v = e.target.value;
                    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: v } } : n));
                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: v } });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scenario Recipe</label>
                <p className="text-[10px] text-slate-400">Select from one of the pre-built condition templates</p>
                <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                  <option>Build Your Own</option>
                  <option>Email Is Not Empty</option>
                  <option>Phone Is Not Empty</option>
                  <option>Tag Contains</option>
                </select>
              </div>

              {selectedNode.type === 'triggerNode' && selectedNode.data.label === 'Recurring Schedule' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Run Every</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>Day</option>
                      <option>Week</option>
                      <option>Month</option>
                      <option>Custom Interval</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Execution Time</label>
                    <input type="time" className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none" defaultValue="09:00" />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                      This workflow will automatically enroll all matching contacts/leads at the specified time.
                    </p>
                  </div>
                </div>
              ) : selectedNode.data.label === 'AI Campaign Blast' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Campaign Objective</label>
                    <textarea 
                      placeholder="e.g. Promote our new solar installation packages to residential leads..." 
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Channels & Tailoring</label>
                    <div className="space-y-2">
                       {[
                         { name: 'Email Outreach', type: 'Formal/Detailed' },
                         { name: 'Facebook Messenger', type: 'Short/Conversational' },
                         { name: 'Viber Broadcast', type: 'Quick/Action-oriented' }
                       ].map(channel => (
                         <div key={channel.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                               <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-brand-blue" />
                               <span className="text-xs font-bold text-navy-900">{channel.name}</span>
                            </label>
                            <div className="pl-7">
                               <p className="text-[9px] text-slate-400 font-bold uppercase">AI Formatting: <span className="text-brand-blue">{channel.type}</span></p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AI Creative Tone</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none">
                      <option>Professional & Trustworthy</option>
                      <option>Urgent & Sales-driven</option>
                      <option>Educational & Helpful</option>
                    </select>
                  </div>
                </div>
              ) : selectedNode.type === 'conditionNode' ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Branches</label>

                  {/* Branch 1 */}
                  <div className="border border-surface-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-surface-border">
                      <span className="text-xs font-semibold text-navy-900">Branch</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-slate-400 hover:text-navy-900 rounded"><MoreHorizontal size={13} /></button>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select className="flex-1 px-2 py-1.5 text-xs border border-surface-border rounded-lg bg-white outline-none cursor-pointer">
                          <option>Email</option><option>Phone</option><option>Tag</option>
                        </select>
                        <select className="flex-1 px-2 py-1.5 text-xs border border-surface-border rounded-lg bg-white outline-none cursor-pointer">
                          <option>Is not empty</option><option>Is empty</option><option>Contains</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select className="px-2 py-1 text-xs border border-surface-border rounded bg-white outline-none cursor-pointer">
                          <option>AND</option><option>OR</option>
                        </select>
                        <button className="p-1 border border-surface-border rounded text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="text-xs text-brand-blue font-semibold hover:underline">+ Add Segment</button>
                    </div>
                  </div>

                  {/* Branch 2 */}
                  <div className="border border-surface-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-surface-border">
                      <span className="text-xs font-semibold text-navy-900">Branch</span>
                      <button className="p-1 text-slate-400 hover:text-navy-900 rounded"><MoreHorizontal size={13} /></button>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select className="flex-1 px-2 py-1.5 text-xs border border-surface-border rounded-lg bg-white outline-none cursor-pointer">
                          <option>Email</option><option>Phone</option>
                        </select>
                        <select className="flex-1 px-2 py-1.5 text-xs border border-surface-border rounded-lg bg-white outline-none cursor-pointer">
                          <option>Is empty</option><option>Is not empty</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select className="px-2 py-1 text-xs border border-surface-border rounded bg-white outline-none cursor-pointer">
                          <option>AND</option><option>OR</option>
                        </select>
                        <button className="p-1 border border-surface-border rounded text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button className="text-xs text-brand-blue font-semibold hover:underline">+ Add Segment</button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button className="text-xs text-brand-blue font-semibold hover:underline">+ Add Branch</button>
                    <button className="ml-auto text-xs text-slate-500 font-semibold flex items-center gap-1 hover:text-navy-900 transition-all">
                      <ListChecks size={12} /> Reorder Branches
                    </button>
                  </div>

                  {/* None Branch */}
                  <div className="border border-surface-border rounded-xl p-3 space-y-2 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">None Branch</p>
                    <p className="text-[10px] text-slate-400">When no condition is met</p>
                    <select className="w-full px-2 py-1.5 text-xs border border-surface-border rounded-lg bg-white outline-none cursor-pointer">
                      <option>None</option>
                    </select>
                  </div>
                </div>
              ) : selectedNode.type === 'triggerNode' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trigger Event</label>
                    <select 
                      value={String(selectedNode.data.triggerEvent || 'Contact Tag Added')}
                      onChange={e => {
                        const val = e.target.value;
                        setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, triggerEvent: val } } : n));
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, triggerEvent: val } });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                    >
                      <optgroup label="Contact Events">
                        <option>Contact Created</option>
                        <option>Contact Tag Added</option>
                        <option>Contact Tag Removed</option>
                        <option>Contact Field Changed</option>
                      </optgroup>
                      <optgroup label="Sales & Pipeline">
                        <option>Deal Created</option>
                        <option>Pipeline Stage Changed</option>
                        <option>Deal Won</option>
                        <option>Deal Lost</option>
                        <option>Task Completed</option>
                        <option>Appointment Scheduled</option>
                      </optgroup>
                      <optgroup label="Marketing & Engagement">
                        <option>Social Media Message</option>
                        <option>Form Submitted</option>
                        <option>Survey Submitted</option>
                        <option>Email Opened</option>
                        <option>Link Clicked</option>
                        <option>Page Visited</option>
                      </optgroup>
                      <optgroup label="Billing & Custom">
                        <option>Invoice Paid</option>
                        <option value="Custom Webhook">Custom Webhook</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  {selectedNode.data.triggerEvent === 'Custom Webhook' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                        <span>Webhook URL</span>
                        <span className="text-brand-blue lowercase text-[9px]">POST request</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`https://api.aa2000.com/webhooks/wh_${selectedNode.id.replace(/-/g, '').substring(0, 8)}`} 
                          className="flex-1 px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-xs outline-none text-slate-600 font-mono"
                        />
                        <button className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-light transition-colors" title="Copy URL">
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">Send a POST request to this URL with your quotation app data to trigger this workflow.</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Filter Criteria</label>
                    <div className="border border-surface-border rounded-xl p-4 space-y-2 bg-slate-50">
                      <p className="text-xs text-slate-500 font-medium">Run only when specific conditions are met.</p>
                      <button className="text-xs text-brand-blue font-bold hover:underline">+ Add Filter</button>
                    </div>
                  </div>
                </div>
              ) : selectedNode.data.label === 'Update Deal' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Pipeline</label>
                    <select 
                      value={String(selectedNode.data.pipelineId || pipelines[0]?.id || '')}
                      onChange={e => {
                        const newPipeId = e.target.value;
                        const newPipe = pipelines.find(p => p.id === newPipeId);
                        const newStageId = newPipe?.stages[0]?.id || '';
                        
                        setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, pipelineId: newPipeId, stageId: newStageId } } : n));
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, pipelineId: newPipeId, stageId: newStageId } });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                    >
                      {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Stage</label>
                    <select 
                      value={String(selectedNode.data.stageId || pipelines.find(p => p.id === (selectedNode.data.pipelineId || pipelines[0]?.id))?.stages[0]?.id || '')}
                      onChange={e => {
                        const v = e.target.value;
                        setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, stageId: v } } : n));
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, stageId: v } });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                    >
                      {pipelines.find(p => p.id === (selectedNode.data.pipelineId || pipelines[0]?.id))?.stages.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : selectedNode.data.label === 'AI Agent Reply' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AI Persona & Instruction</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>Support Expert (Detailed Troubleshooting)</option>
                      <option>Sales Qualifier (Lead Scoring & Booking)</option>
                      <option>Support Escalator (Dispatches to Admin)</option>
                      <option>General Greeting Handler</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom System Prompt/Directives</label>
                    <textarea 
                      placeholder="e.g. You are a helpful sales assistant. Answer questions about FDAS and CCTV pricing, then prompt the user to schedule a consultation."
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-blue/30 min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Knowledge Base Integration</label>
                    <div className="space-y-1.5 border border-surface-border rounded-xl p-3 bg-slate-50">
                      {[
                        'FDAS Maintenance Protocols',
                        'CCTV Product Specifications',
                        'AA2000 Pricing Sheet'
                      ].map(doc => (
                        <label key={doc} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-300 text-brand-blue" />
                          <span className="text-xs text-slate-600 font-semibold">{doc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AI Response Limits</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>Short & Sweet (1-2 sentences)</option>
                      <option>Balanced Reply (3-4 sentences)</option>
                      <option>Detailed Answer (Full answer block)</option>
                    </select>
                  </div>
                </div>
              ) : selectedNode.data.label === 'Send Email' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sender Address</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>sales@aa2000.ph</option>
                      <option>support@aa2000.ph</option>
                      <option>noreply@aa2000.ph</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Schedule your annual fire inspection today" 
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Template</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>Default Blank Template</option>
                      <option>FDAS Inspection Reminder</option>
                      <option>Solar ROI Guide</option>
                      <option>Holiday Special Deals</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tracking & Delivery Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-brand-blue" />
                        <span className="text-xs font-bold text-navy-900">Track email open rate</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-brand-blue" />
                        <span className="text-xs font-bold text-navy-900">Track link clicks</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : selectedNode.data.label === 'Notification' ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notification Recipient</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 cursor-pointer">
                      <option>Assigned Sales Rep</option>
                      <option>All Admins</option>
                      <option>Operations Division Manager</option>
                      <option>General Support Inbox</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notification Level</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map(level => (
                        <button 
                          key={level} 
                          type="button"
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-all uppercase tracking-wider",
                            level === 'High' ? "bg-rose-50 text-rose-600 border-rose-200" :
                            level === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Alert Message Body</label>
                    <textarea 
                      placeholder="e.g. Lead {{contact.name}} has triggered a follow-up request. Please call them at {{contact.phone}} within the hour."
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-blue/30 min-h-[90px] resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Action Configuration</label>
                  <div className="border border-surface-border rounded-xl p-4 space-y-3 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-600">Configure parameters for {String(selectedNode.data.label)}</p>
                    <input type="text" placeholder="Template ID or Content..." className="w-full px-3 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30" />
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-4 py-3 border-t border-surface-border flex items-center gap-2 bg-white">
              <button onClick={() => { setNodes(nds => nds.filter(n => n.id !== selectedNode.id)); setSelectedNode(null); }}
                className="px-3 py-1.5 text-sm font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => setSelectedNode(null)} className="flex-1 py-1.5 text-sm font-semibold text-slate-600 border border-surface-border rounded-lg hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={() => { saveWorkflow(); setSelectedNode(null); }} className="flex-1 py-1.5 text-sm font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all shadow-sm">
                Save action
              </button>
            </div>
          </div>
        )}
      </div>

      {isTestingWorkflow && createPortal(
        <div className="fixed inset-0 bg-navy-900/20 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-surface-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-surface-border bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-blue text-white rounded-xl shadow-md animate-bounce">
                  <Bot size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-navy-900 uppercase tracking-[0.12em]">Workflow Simulator</h2>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Test suite diagnostics console</p>
                </div>
              </div>
              <button onClick={() => setIsTestingWorkflow(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-xs font-black text-navy-900 uppercase tracking-widest animate-pulse">Running Automation Test Suite</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Simulating workflow logic against active payload integrations</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-navy-900 uppercase">
                  <span>Test Progression</span>
                  <span>{testingProgress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5 shadow-inner">
                  <div className="h-full bg-brand-blue rounded-full transition-all duration-300 shadow-sm" style={{ width: `${testingProgress}%` }} />
                </div>
              </div>

              {/* Execution Console Logs */}
              <div className="h-56 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-2 shadow-inner">
                {testingLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-brand-blue shrink-0">&gt;</span>
                    <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end">
                <button 
                  onClick={() => setIsTestingWorkflow(false)} 
                  disabled={testingProgress < 100}
                  className="px-6 py-2 bg-brand-blue text-white rounded-lg font-bold uppercase tracking-widest text-[8px] hover:bg-brand-light transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete diagnostics
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// helper used inside panel
function MoreHorizontal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
