import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Mail, MessageSquare, UserPlus, Clock, Split, Bell, Play } from 'lucide-react';

interface WorkflowNodeData {
  label: string;
  type?: 'trigger' | 'action' | 'condition';
  iconType?: string;
  description?: string;
  [key: string]: unknown;
}

const icons: Record<string, React.ElementType> = {
  trigger: Zap,
  email: Mail,
  sms: MessageSquare,
  contact: UserPlus,
  wait: Clock,
  condition: Split,
  notify: Bell,
  action: Play
};

export const WorkflowNode = memo(({ data, isConnectable }: { data: WorkflowNodeData; isConnectable: boolean }) => {
  const Icon = icons[data.iconType || 'action'] || icons.action;
  const isTrigger = data.type === 'trigger';

  return (
    <div className={`min-w-[200px] bg-white rounded-xl shadow-premium border-2 ${isTrigger ? 'border-navy-900' : 'border-slate-100'} overflow-hidden transition-all hover:shadow-xl group`}>
      <div className={`p-3 flex items-center gap-3 ${isTrigger ? 'bg-navy-900 text-white' : 'bg-slate-50 text-navy-900 border-b border-slate-100'}`}>
        <div className={`p-1.5 rounded-lg ${isTrigger ? 'bg-brand-blue/20 text-brand-light' : 'bg-white text-brand-blue shadow-sm'}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isTrigger ? 'text-brand-light' : 'text-slate-400'}`}>
            {data.type}
          </p>
          <h3 className="text-xs font-bold truncate">{data.label}</h3>
        </div>
      </div>
      
      {data.description && (
        <div className="p-3">
          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
            {data.description}
          </p>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-brand-blue border-2 border-white !-top-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-brand-blue border-2 border-white !-bottom-1.5"
      />
    </div>
  );
});

export const TriggerNode = memo(({ data, isConnectable }: { data: WorkflowNodeData; isConnectable: boolean }) => (
  <div className="bg-navy-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-brand-blue/30 min-w-[240px]">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-light">
        <Zap size={20} fill="currentColor" />
      </div>
      <div>
        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
        <p className="text-[10px] text-brand-light/60 font-medium uppercase">Workflow Trigger</p>
      </div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      isConnectable={isConnectable}
      className="w-4 h-4 bg-brand-blue border-4 border-navy-900 !-bottom-2"
    />
  </div>
));

export const ConditionNode = memo(({ data, isConnectable }: { data: WorkflowNodeData; isConnectable: boolean }) => (
  <div className="bg-white rounded-2xl shadow-premium border-2 border-amber-100 overflow-hidden min-w-[220px]">
    <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center gap-3 text-amber-900">
      <Split size={16} />
      <h3 className="text-xs font-bold uppercase tracking-widest">If / Else</h3>
    </div>
    <div className="p-4">
       <p className="text-xs font-medium text-slate-600">{data.label}</p>
    </div>
    <Handle
      type="target"
      position={Position.Top}
      isConnectable={isConnectable}
      className="w-3 h-3 bg-amber-400 border-2 border-white !-top-1.5"
    />
    <div className="flex justify-between px-10 pb-4 relative">
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-emerald-600">YES</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-rose-600">NO</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        isConnectable={isConnectable}
        className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white !bottom-[-7px] !left-[25%] !translate-x-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        isConnectable={isConnectable}
        className="w-3.5 h-3.5 bg-rose-500 border-2 border-white !bottom-[-7px] !left-[75%] !translate-x-0"
      />
    </div>
  </div>
));
