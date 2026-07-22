import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Clock, 
  DollarSign,
  Target,
  ChevronDown,
  Settings,
  X,
  Layout,
  Trash2,
  Edit,
  Users,
  Mail,
  Phone,
  Zap,
  Flame
} from 'lucide-react';
import { usePipelinesStore } from '../../stores/modules/pipelinesStore';
import { useCRMStore } from '../../stores/modules/crmStore';
import { useEngagementStore } from '../../stores/modules/engagementStore';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { PipelineAutomationModal } from './PipelineAutomationModal';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '../../services/db';

// Sortable Deal Card Component
const SortableDealCard = ({ deal, onDelete }: { deal: Deal, onDelete: (id: string) => void }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const signal = useEngagementStore.getState().getSignalForContact(deal.contactId || deal.id, deal.companyName || deal.title);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-white p-3.5 rounded-lg border border-surface-border shadow-sm hover:border-brand-blue/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 
            onClick={(e) => { e.stopPropagation(); navigate(`/pipeline/${deal.id}`); }}
            className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition-colors line-clamp-1 cursor-pointer"
          >
            {deal.title}
          </h4>
          {signal && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider inline-flex items-center gap-0.5 mt-1",
              signal.signal === 'closing' ? "bg-rose-100 text-rose-700" :
              signal.signal === 'hot' ? "bg-orange-100 text-orange-700" :
              signal.signal === 'warm' ? "bg-amber-100 text-amber-700" :
              "bg-blue-100 text-blue-700"
            )}>
              {signal.signal === 'closing' || signal.signal === 'hot' ? <Flame size={8} /> : <Zap size={8} />}
              {signal.label}
            </span>
          )}
        </div>
        <div className="relative">
          <button 
            {...attributes} {...listeners}
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="p-1 hover:bg-slate-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={14} className="text-slate-400" />
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-surface-border rounded-lg shadow-premium z-50 overflow-hidden">
              <button 
                onClick={() => navigate(`/pipeline/${deal.id}`)}
                className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit size={12} /> View/Edit
              </button>
              <button 
                onClick={() => { if(confirm('Delete deal?')) onDelete(deal.id); }}
                className="w-full text-left px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div {...attributes} {...listeners} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign size={12} className="text-slate-300" />
            <span className="text-xs font-bold text-navy-900">{formatCurrency(deal.value)}</span>
          </div>
          {deal.product && (
            <span className="text-[9px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-[100px]">
              {deal.product}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
             <div className="w-5 h-5 rounded-full bg-navy-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm uppercase italic">
                {(deal.companyName || 'U').charAt(0)}
             </div>
             <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[100px]">{deal.companyName || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 group-hover:text-brand-blue transition-colors">
             <Clock size={12} />
             <span className="text-[10px] font-medium">New</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineBoardPage = () => {
  const { deals, pipelines, activePipelineId, fetchData, setActivePipeline, updateDealStage, addDeal, deleteDeal, addPipeline, updatePipeline, addStage, deleteStage } = usePipelinesStore();
  const { contacts, companies, fetchContacts, fetchCompanies } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
  const [isEditPipelineModalOpen, setIsEditPipelineModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [automationNotification, setAutomationNotification] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const stageInputRef = useRef<HTMLInputElement>(null);

  const [newDeal, setNewDeal] = useState({ 
    title: '', 
    value: 0, 
    companyName: '', 
    product: '',
    contactId: '',
    status: 'Open' as 'Open' | 'Won' | 'Lost' | 'Abandoned'
  });
  const [newDealStage, setNewDealStage] = useState('');
  const [newDealOwner, setNewDealOwner] = useState('Unassigned');
  const [newPipelineName, setNewPipelineName] = useState('');
  const [editingPipelineName, setEditingPipelineName] = useState('');

  const selectedContact = useMemo(() => 
    contacts.find(c => c.id === newDeal.contactId),
  [contacts, newDeal.contactId]);

  useEffect(() => {
    fetchData();
    fetchContacts();
    fetchCompanies();
  }, [fetchData, fetchContacts, fetchCompanies]);

  useEffect(() => {
    if (isAddingStage && stageInputRef.current) {
      stageInputRef.current.focus();
    }
  }, [isAddingStage]);

  const activePipeline = useMemo(() => 
    pipelines.find(p => p.id === activePipelineId) || pipelines[0],
  [pipelines, activePipelineId]);

  useEffect(() => {
    if (isNewDealModalOpen && activePipeline?.stages?.length > 0) {
      setNewDealStage(activePipeline.stages[0].id);
    }
  }, [isNewDealModalOpen, activePipeline]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredDeals = useMemo(() => 
    deals.filter(deal => 
      deal.pipelineId === activePipeline?.id && (
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    ),
  [deals, activePipeline, searchTerm]);

  const getDealsInStage = (stageId: string) => {
    return filteredDeals.filter(d => d.stageId === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getDealsInStage(stageId).reduce((sum, d) => sum + d.value, 0);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    const overStage = activePipeline?.stages.find(s => s.id === overId);
    const overDeal = filteredDeals.find(d => d.id === overId);
    
    if (overStage) {
      updateDealStage(dealId, overStage.id);
    } else if (overDeal) {
      updateDealStage(dealId, overDeal.stageId);
    }
    
    setActiveId(null);
  };

  const handleAddDeal = () => {
    if (!activePipeline) return;
    const selectedCompany = selectedContact?.companyId ? companies.find(c => c.id === selectedContact.companyId) : null;
    addDeal({
      title: newDeal.title,
      value: newDeal.value,
      companyId: selectedContact?.companyId || '',
      companyName: selectedCompany ? selectedCompany.name : '',
      product: newDeal.product,
      pipelineId: activePipeline.id,
      stageId: newDealStage || activePipeline.stages[0].id,
      contactId: newDeal.contactId,
      status: newDeal.status,
      assigned: 'Admin'
    });
    setIsNewDealModalOpen(false);
    setNewDeal({ title: '', value: 0, companyName: '', product: '', contactId: '', status: 'Open' });
  };

  const handleAddPipeline = () => {
    addPipeline({
      name: newPipelineName,
      stages: [
        { id: `s-${Math.random().toString(36).substr(2, 5)}`, name: 'Lead', order: 0 },
        { id: `s-${Math.random().toString(36).substr(2, 5)}`, name: 'Won', order: 1 },
      ]
    });
    setIsNewPipelineModalOpen(false);
    setNewPipelineName('');
  };

  const handleAddStage = () => {
    if (!activePipeline || !newStageName.trim()) return;
    addStage(activePipeline.id, newStageName.trim());
    setNewStageName('');
    setIsAddingStage(false);
  };

  if (!activePipeline && pipelines.length === 0) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
        <Layout size={48} className="text-slate-300 mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-navy-900 mb-2">No Pipelines Found</h2>
        <p className="text-sm text-slate-500 max-w-md text-center mb-6">
          Get started by creating your first sales or marketing pipeline. Define stages to track your deals and opportunities.
        </p>
        <button 
          onClick={() => setIsNewPipelineModalOpen(true)}
          className="px-6 py-3 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-light transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> Create Pipeline
        </button>
      </div>
    );
  }

  return (
    <AnimatedPage className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Layout size={20} className="text-brand-blue" />
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">{activePipeline?.name}</h1>
              <div className="relative group">
                <button className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-surface-border rounded-xl shadow-premium z-50 hidden group-hover:block overflow-hidden">
                  {pipelines.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setActivePipeline(p.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 ${p.id === activePipelineId ? 'text-brand-blue bg-blue-50/50' : 'text-slate-600'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 p-2">
                    <button 
                      onClick={() => setIsNewPipelineModalOpen(true)}
                      className="w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      <span>Create New Pipeline</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500">Track sales opportunities from inquiry to close.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search opportunities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-surface-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-blue/30 focus:border-brand-blue transition-all shadow-sm w-64"
            />
          </div>
          <button
            onClick={() => setIsAutomationModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Auto-Pipeline Rules & Webhook API</span>
          </button>
          <button 
            onClick={() => setIsNewDealModalOpen(true)}
            className="premium-button flex items-center gap-2 text-xs"
          >
            <Plus size={16} />
            <span>New Deal</span>
          </button>
          <button 
            onClick={() => {
              if (activePipeline) {
                setEditingPipelineName(activePipeline.name);
                setIsEditPipelineModalOpen(true);
              }
            }}
            className="p-2 text-slate-400 hover:text-navy-900 hover:bg-white border border-transparent hover:border-surface-border rounded-lg transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {automationNotification && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-emerald-600 shrink-0" />
            <span>{automationNotification}</span>
          </div>
          <button onClick={() => setAutomationNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <div className="flex gap-4 min-h-full pb-4">
            {activePipeline?.stages.map(stage => (
              <div key={stage.id} className="w-72 shrink-0 flex flex-col bg-slate-50/50 rounded-xl border border-surface-border overflow-hidden">
                <div className="p-3 border-b border-surface-border bg-white/50 group/stage">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[11px] font-bold text-navy-900 uppercase tracking-wider">{stage.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{getDealsInStage(stage.id).length}</span>
                      {activePipeline.stages.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${stage.name}" stage?`)) deleteStage(activePipeline.id, stage.id);
                          }}
                          className="p-1 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover/stage:opacity-100"
                          title="Delete Stage"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-brand-blue italic">{formatCurrency(getStageValue(stage.id))}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  <SortableContext 
                    items={getDealsInStage(stage.id).map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getDealsInStage(stage.id).map(deal => (
                      <SortableDealCard key={deal.id} deal={deal} onDelete={deleteDeal} />
                    ))}
                  </SortableContext>
                  
                  {getDealsInStage(stage.id).length === 0 && (
                     <div className="h-24 flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed border-slate-200 rounded-lg">
                        <Target size={20} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Drop Here</span>
                     </div>
                  )}
                </div>
              </div>
            ))}
            
            {isAddingStage ? (
              <div className="w-72 shrink-0 bg-slate-50 rounded-xl border border-brand-blue/30 border-dashed p-4 flex flex-col gap-3">
                <p className="text-[10px] font-bold text-navy-900 uppercase tracking-wider">New Stage Name</p>
                <input
                  ref={stageInputRef}
                  type="text"
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddStage(); if (e.key === 'Escape') setIsAddingStage(false); }}
                  placeholder="e.g. Closed Won"
                  className="px-3 py-2 border border-surface-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddStage} className="flex-1 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-light transition-all">Add</button>
                  <button onClick={() => { setIsAddingStage(false); setNewStageName(''); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><X size={16} /></button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingStage(true)}
                className="w-72 shrink-0 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl hover:bg-white hover:border-brand-blue/30 transition-all group"
              >
                <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-slate-100 rounded-full group-hover:bg-brand-blue/10 group-hover:text-brand-blue">
                    <Plus size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Add Stage</span>
                </div>
              </button>
            )}
          </div>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-3.5 rounded-lg border border-brand-blue shadow-xl cursor-grabbing rotate-3">
              <h4 className="text-xs font-bold text-navy-900 line-clamp-1">
                {deals.find(d => d.id === activeId)?.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* NEW DEAL MODAL - Redesigned to match enterprise screenshot */}
      {isNewDealModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex min-h-[600px]">
            {/* Modal Sidebar */}
            <div className="w-64 bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col justify-between">
              <div className="space-y-1">
                <button className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold bg-brand-blue/10 text-brand-blue shadow-sm">
                  Opportunity Details
                </button>
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-brand-blue px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors">
                <Settings size={14} />
                <span>Add/Manage Fields</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 tracking-tight">Add new opportunity</h2>
                  <p className="text-sm text-slate-500 mt-1">Create new opportunity by filling in details and selecting a contact</p>
                </div>
                <button onClick={() => setIsNewDealModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                {/* Contact Details Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-navy-900">
                    <Users size={18} className="text-brand-blue" />
                    <h3 className="text-sm font-bold tracking-tight">Contact details</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Contact Name *</label>
                      <select 
                        value={newDeal.contactId}
                        onChange={(e) => setNewDeal({...newDeal, contactId: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      >
                        <option value="">Select Contact</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="email" 
                          readOnly
                          placeholder="Enter Email"
                          value={selectedContact?.email || ''}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-surface-border rounded-xl text-sm text-slate-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="tel" 
                          readOnly
                          placeholder="Phone"
                          value={selectedContact?.phone || ''}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-surface-border rounded-xl text-sm text-slate-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Opportunity Details Section */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-navy-900 tracking-tight">Opportunity Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Opportunity Name *</label>
                      <input 
                        type="text" 
                        placeholder="Enter opportunity name"
                        value={newDeal.title}
                        onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-surface-border rounded-xl text-sm font-bold text-navy-900 outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pipeline</label>
                        <select 
                          value={activePipelineId || ''}
                          onChange={(e) => setActivePipeline(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Stage</label>
                        <select value={newDealStage} onChange={e => setNewDealStage(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all">
                          {activePipeline?.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                        <select 
                          value={newDeal.status}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={(e) => setNewDeal({...newDeal, status: e.target.value as any})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        >
                          <option value="Open">Open</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                          <option value="Abandoned">Abandoned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Opportunity Value</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                          <input 
                            type="number" 
                            value={newDeal.value}
                            onChange={(e) => setNewDeal({...newDeal, value: Number(e.target.value)})}
                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-bold text-navy-900 outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Owner</label>
                        <select value={newDealOwner} onChange={e => setNewDealOwner(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all">
                          <option value="Admin">Rose Bombales</option>
                          <option value="Unassigned">Unassigned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Followers</label>
                        <div className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm text-slate-400 italic">
                          Add Followers
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsNewDealModalOpen(false)}
                  className="px-8 py-2.5 bg-white border border-surface-border text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddDeal}
                  disabled={!newDeal.title || !newDeal.contactId}
                  className="px-12 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pipeline Modal */}
      {isEditPipelineModalOpen && activePipeline && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-navy-900">Edit Pipeline</h2>
              <button onClick={() => setIsEditPipelineModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pipeline Name</label>
                <input 
                  type="text" 
                  value={editingPipelineName}
                  onChange={(e) => setEditingPipelineName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsEditPipelineModalOpen(false)}
                className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  updatePipeline(activePipeline.id, { name: editingPipelineName });
                  setIsEditPipelineModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Pipeline Modal */}
      {isNewPipelineModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-navy-900">Create New Pipeline</h2>
              <button onClick={() => setIsNewPipelineModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pipeline Name</label>
                <input 
                  type="text" 
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-surface-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                  placeholder="e.g. Real Estate Sales"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsNewPipelineModalOpen(false)}
                className="flex-1 py-2.5 bg-white text-slate-600 border border-surface-border rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPipeline}
                className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-light transition-all"
              >
                Create Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Automation & Webhook API Modal */}
      <PipelineAutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
        onEventProcessed={(msg) => setAutomationNotification(msg)}
      />
    </AnimatedPage>
  );
};

export default PipelineBoardPage;
