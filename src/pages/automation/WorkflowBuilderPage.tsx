import { useCallback, useState, useRef } from 'react';
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

export default function WorkflowBuilderPage() {
  const { addWorkflow, updateWorkflow, submitForApproval, approveWorkflow, rejectWorkflow, workflows } = useAutomationStore();
  const { pipelines } = usePipelinesStore();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
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

  const currentWorkflow = currentWorkflowId ? workflows.find(w => w.id === currentWorkflowId) : null;

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return <WorkflowListPage onOpen={openBuilder} onCreateNew={createNew} />;
  }

  // ── BUILDER VIEW ───────────────────────────────────────────────────────────
  const builderTabs = ['Builder', 'Settings', 'Enrollment History', 'Execution Logs'];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden -mx-6 -mt-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-surface-border shrink-0 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 transition-colors shrink-0 font-medium">
            <ChevronLeft size={18} /> Back to Workflows
          </button>
          <span className="text-slate-200 shrink-0">|</span>
          <div className="flex items-center gap-1.5 min-w-0">
            {isEditingName ? (
              <input
                autoFocus value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="text-sm font-semibold text-navy-900 border-b border-brand-blue outline-none bg-transparent truncate max-w-xs"
              />
            ) : (
              <span className="text-sm font-semibold text-navy-900 truncate max-w-xs">{workflowName}</span>
            )}
            <button onClick={() => setIsEditingName(true)} className="p-1 text-slate-400 hover:text-navy-900 transition-colors shrink-0">
              <Pencil size={13} />
            </button>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center border-b-0 gap-0 shrink-0">
          {builderTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-all',
                activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900'
              )}>
              {tab}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-surface-border rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm">
            <Play size={13} /> Test Workflow
          </button>

          {approvalStatus === 'active' ? (
            <span className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Active
            </span>
          ) : approvalStatus === 'pending_approval' ? (
            <span className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1.5">
              <Hourglass size={13} /> Pending Approval
            </span>
          ) : approvalStatus === 'approved' ? (
            <button
              onClick={() => { if (currentWorkflowId) { approveWorkflow(currentWorkflowId); setApprovalStatus('active'); setIsPublished(true); } }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play size={13} /> Activate Now
            </button>
          ) : (
            <button
              onClick={() => { if (currentWorkflowId) { submitForApproval(currentWorkflowId); setApprovalStatus('pending_approval'); } }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-all shadow-sm flex items-center gap-1.5"
            >
              <SendHorizonal size={13} /> Submit for Approval
            </button>
          )}

          <button onClick={saveWorkflow} className="px-3 py-1.5 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all shadow-sm">
            Saved
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
              <button className="flex-1 py-1.5 text-sm font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-light transition-all shadow-sm">
                Save action
              </button>
            </div>
          </div>
        )}
      </div>
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
