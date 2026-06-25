import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn';

const tabs = [
  { label: 'Social Planner',    path: 'social-planner' },
  { label: 'Emails',            path: 'emails' },
  { label: 'AI Automations',    path: 'ai-automations' },
];

export const PlaceholderModule = ({ name }: { name: string }) => (
  <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2">
     <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-transparent"></div>
        <span className="text-4xl font-semibold">A</span>
     </div>
     <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-navy-900 tracking-tighter uppercase">{name} Synchronization</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
           Initializing enterprise synchronization for the Philippine market. Module is ready for license verification.
        </p>
     </div>
      <button onClick={() => alert('License verification initiated. Please check your AA2000 Portal for updates.')} className="px-8 py-3 bg-brand-blue text-white font-semibold uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-light transition-all shadow-xl shadow-brand-blue/20">
        Verify Enterprise License
      </button>
  </div>
);

export const MarketingLayout = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-navy-900 mb-1 tracking-tighter uppercase">Marketing</h1>
        <p className="text-slate-500 font-medium">Create campaigns, schedule posts, and manage email marketing</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar border border-surface-border w-fit shadow-inner">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/marketing/${tab.path}`}
            className={({ isActive }) => cn(
              "px-4 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
              isActive 
                ? "bg-white text-brand-blue shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="fade-in min-h-[600px]">
        <Outlet />
      </div>
    </div>
  );
};
