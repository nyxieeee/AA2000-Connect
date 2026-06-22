import { useState } from 'react';
import { Folder, ChevronRight, Search, Plus, Sparkles, SlidersHorizontal, Clock, List, ExternalLink, Trash2, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAutomationStore, type Workflow, type WorkflowFolder, type ApprovalStatus } from '../../stores/modules/automationStore';
import { useAuthStore } from '../../stores/authStore';
import CreateWorkflowModal from './CreateWorkflowModal';

interface Props { onOpen: (wf: Workflow) => void; onCreateNew: (folderId?: string) => void; }

const APPROVAL_BADGES: Record<ApprovalStatus, { label: string; className: string; icon: any }> = {
  draft: { label: 'Draft', className: 'text-slate-500 bg-slate-50 border-slate-200', icon: Clock },
  pending_approval: { label: 'Pending Approval', className: 'text-amber-600 bg-amber-50 border-amber-200', icon: Hourglass },
  approved: { label: 'Approved', className: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  active: { label: 'Active', className: 'text-emerald-600 bg-emerald-50 border-emerald-400', icon: CheckCircle2 },
};

export default function WorkflowListPage({ onOpen }: Props) {
  const { folders, workflows, addFolder, deleteFolder, deleteWorkflow, submitForApproval, approveWorkflow, rejectWorkflow } = useAutomationStore();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All Workflows');
  const [openFolder, setOpenFolder] = useState<WorkflowFolder | null>(null);
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const tabs = ['All Workflows', 'Needs Review', 'Deleted'];

  let displayedWorkflows = workflows.filter(w => !w.folderId);
  if (openFolder) {
    displayedWorkflows = workflows.filter(w => w.folderId === openFolder.id);
  }

  if (activeTab === 'Needs Review') {
    displayedWorkflows = displayedWorkflows.filter(w => w.approvalStatus === 'pending_approval');
  }

  displayedWorkflows = displayedWorkflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  const rootFolders = activeTab === 'All Workflows' && !openFolder ? folders : [];
  const needsReviewCount = workflows.filter(w => w.approvalStatus === 'pending_approval').length;

  const handleCreateFolder = () => {
    const name = window.prompt("Enter new folder name:");
    if (name && name.trim()) {
      addFolder(name.trim());
    }
  };

  const handleCreated = (workflowId: string) => {
    setShowCreateModal(false);
    const wf = workflows.find(w => w.id === workflowId);
    if (wf) onOpen(wf);
  };

  return (
    <div className="space-y-5 pb-12">
      {showCreateModal && (
        <CreateWorkflowModal onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 animate-in">
            <h3 className="text-sm font-bold text-navy-900 mb-3">Reason for rejection</h3>
            <textarea
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              placeholder="Explain why this workflow needs changes..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 resize-none"
            />
            <div className="flex items-center gap-2 mt-4 justify-end">
              <button onClick={() => { setRejectId(null); setRejectComment(''); }} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-all">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectId) {
                    rejectWorkflow(rejectId, rejectComment || 'No reason provided');
                    setRejectId(null);
                    setRejectComment('');
                  }
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Workflow List</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleCreateFolder} className="px-3 py-2 bg-white border border-surface-border rounded-lg text-sm font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Folder size={15} /> Create Folder
          </button>
          <button onClick={() => setShowCreateModal(true)} className="px-3 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-purple-50 transition-all shadow-sm">
            <Sparkles size={15} /> Build using AI
          </button>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-brand-light transition-all shadow-sm">
            <Plus size={15} /> Create Workflow
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-surface-border gap-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px flex items-center gap-2',
              activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-navy-900'
            )}>
            {tab}
            {tab === 'Needs Review' && needsReviewCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">{needsReviewCount}</span>
            )}
          </button>
        ))}
        <button className="ml-auto px-3 py-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5 hover:text-navy-900 transition-all">
          <List size={14} /> Customize List
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 hover:text-navy-900 transition-all">
          <SlidersHorizontal size={13} /> Advanced Filters
        </button>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded transition-all"><Clock size={16} /></button>
          <button className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded transition-all"><List size={16} /></button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search" type="text"
              className="pl-8 pr-3 py-1.5 border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 w-48 bg-white" />
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {openFolder && (
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => setOpenFolder(null)} className="text-brand-blue hover:underline font-medium">Home</button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-600 font-medium">{openFolder.name}</span>
        </div>
      )}
      {!openFolder && <p className="text-xs text-slate-400 font-medium">Home</p>}

      {/* Table */}
      <div className="glass-card overflow-hidden border border-surface-border">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-surface-border">
              <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded" /></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3 text-center">Total Enrolled</th>
              <th className="px-4 py-3 text-center">Active Enrolled</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3 w-24">Actions</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {/* Folder rows (only on root) */}
            {rootFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(folder => (
              <tr key={folder.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setOpenFolder(folder)}>
                <td className="px-4 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-navy-900 group-hover:text-brand-blue transition-colors">{folder.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-center"></td>
                <td className="px-4 py-3 text-center"></td>
                <td className="px-4 py-3 text-xs text-slate-500">{folder.updatedAt}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">
                  <button 
                    onClick={e => { e.stopPropagation(); if(confirm('Delete folder?')) deleteFolder(folder.id); }} 
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Workflow rows */}
            {displayedWorkflows.map(wf => {
              const ApprovalBadge = APPROVAL_BADGES[wf.approvalStatus];
              const BadgeIcon = ApprovalBadge.icon;
              return (
              <tr key={wf.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onOpen(wf)}>
                <td className="px-4 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900 group-hover:text-brand-blue transition-colors">{wf.name}</span>
                    {wf.source === 'ai_generated' && (
                      <Sparkles size={12} className="text-purple-500 shrink-0" title="AI Generated" />
                    )}
                    {wf.source === 'template' && (
                      <LayoutTemplateIcon className="text-blue-500 shrink-0" />
                    )}
                    <ExternalLink size={12} className="text-slate-300 group-hover:text-brand-blue transition-colors shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {wf.status === 'Published' ? (
                    <span className="px-2 py-0.5 border border-emerald-400 text-emerald-600 text-[11px] font-semibold rounded-full">Published</span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-semibold rounded-full', ApprovalBadge.className)}>
                    <BadgeIcon size={11} />
                    {ApprovalBadge.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {wf.totalEnrolled > 0 ? <span className="text-xs font-semibold text-brand-blue">{wf.totalEnrolled}</span> : <span className="text-xs text-slate-400">0</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {wf.activeEnrolled > 0 ? <span className="text-xs font-semibold text-brand-blue">{wf.activeEnrolled}</span> : <span className="text-xs text-slate-400">0</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{wf.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                    {wf.approvalStatus === 'pending_approval' && isAdmin && (
                      <>
                        <button onClick={() => approveWorkflow(wf.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve">
                          <CheckCircle2 size={15} />
                        </button>
                        <button onClick={() => { setRejectId(wf.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Reject">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    {wf.approvalStatus === 'draft' && (
                      <button onClick={() => submitForApproval(wf.id)} className="px-2 py-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all">
                        Submit for Approval
                      </button>
                    )}
                    {wf.approvalStatus === 'approved' && (
                      <span className="text-[10px] text-blue-600 font-semibold">Ready to Activate</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={e => { e.stopPropagation(); if(confirm('Delete workflow?')) deleteWorkflow(wf.id); }} 
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-surface-border bg-slate-50/50">
          <button className="px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded cursor-not-allowed bg-slate-50">Previous</button>
          <button className="w-7 h-7 flex items-center justify-center text-xs font-bold bg-white border border-brand-blue text-brand-blue rounded shadow-sm">{page}</button>
          <button className="px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded cursor-not-allowed bg-slate-50">Next</button>
          <span className="text-xs text-slate-400 ml-2">Total: {displayedWorkflows.length}</span>
        </div>
      </div>
    </div>
  );
}

function LayoutTemplateIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
