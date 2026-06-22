import { 
  Clock, Users, CalendarDays, Filter, Download
} from 'lucide-react';

export const WorkflowSettingsTab = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight mb-1">Workflow Configuration</h2>
          <p className="text-sm text-slate-500">Manage how and when contacts can be enrolled in this automation.</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider italic">Enrollment Rules</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-surface-border rounded-xl hover:border-brand-blue/30 transition-all">
              <div>
                <p className="text-sm font-bold text-navy-900">Allow Re-enrollment</p>
                <p className="text-xs text-slate-400 mt-0.5">Let contacts enter this workflow again after finishing it.</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-surface-border rounded-xl hover:border-brand-blue/30 transition-all">
              <div>
                <p className="text-sm font-bold text-navy-900">Stop on Response</p>
                <p className="text-xs text-slate-400 mt-0.5">Automatically pull contact out of workflow if they reply to a message.</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-blue">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider italic">Execution Window</h3>
          <p className="text-sm text-slate-600 mb-4">When should the automated actions (emails, SMS) be allowed to send?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-brand-blue/30 bg-brand-blue/5 rounded-xl cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-brand-blue">Any Time</span>
                <div className="w-4 h-4 rounded-full border-4 border-brand-blue bg-white"></div>
              </div>
              <p className="text-xs text-slate-500">Actions occur exactly when triggered.</p>
            </div>
            
            <div className="p-4 border border-surface-border bg-white rounded-xl cursor-pointer hover:border-brand-blue/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-navy-900">Specific Times</span>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
              </div>
              <p className="text-xs text-slate-500">Restrict actions to business hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorkflowEnrollmentTab = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="p-6 flex items-center justify-between border-b border-surface-border bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">Active Enrollments</h2>
          <p className="text-sm text-slate-500">Monitoring 0 contacts currently processing through this workflow.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-surface-border rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            <Filter size={14} /> Filter
          </button>
          <button className="px-3 py-1.5 border border-surface-border rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-sm">
          <Users size={32} />
        </div>
        <h3 className="text-base font-bold text-navy-900">No active enrollments</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Once published, contacts who meet the trigger criteria will appear here. You can also manually enroll contacts.
        </p>
        <button className="mt-6 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-light transition-all shadow-sm">
          Enroll Contacts
        </button>
      </div>
    </div>
  );
};

export const WorkflowLogsTab = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="p-6 flex items-center justify-between border-b border-surface-border bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">Execution Logs</h2>
          <p className="text-sm text-slate-500">Real-time audit trail of all node executions.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-surface-border rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            <CalendarDays size={14} /> Last 7 Days
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-sm">
          <Clock size={32} />
        </div>
        <h3 className="text-base font-bold text-navy-900">Logs are empty</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Detailed execution logs will generate here once the workflow runs and processes contacts.
        </p>
      </div>
    </div>
  );
};
