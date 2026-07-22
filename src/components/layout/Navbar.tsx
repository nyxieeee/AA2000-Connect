import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationsStore } from '../../stores/modules/notificationsStore';

export const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const unread = useNotificationsStore(s => s.notifications.filter(n => !n.read).length);

  return (
    <nav className="h-20 bg-white border-b border-surface-border flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-6">
        {/* Real-time Status Badge */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
           <div className="relative">
              <Wifi size={14} className="text-emerald-500" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
           </div>
           <span className="text-[9px] font-black text-navy-900 uppercase tracking-widest">Server Live Link: <span className="text-emerald-600">Active</span></span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={cn(
          "hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl transition-all w-64 group",
          isSearchFocused && "w-96 bg-white border-brand-blue/30 shadow-lg"
        )}>
          <Search size={16} className={cn("transition-colors", isSearchFocused ? "text-brand-blue" : "text-slate-400")} />
          <input 
            type="text" 
            placeholder="Search Clients or Deals..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent border-none outline-none text-xs font-bold text-navy-900 w-full placeholder:text-slate-300 uppercase tracking-wider"
          />
        </div>
        
        <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
          <button onClick={() => navigate('/notifications')} className="relative p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-white hover:text-navy-900 border border-slate-100 transition-all group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold border-2 border-white rounded-full px-1">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:border-brand-blue transition-all">
             <div className="w-full h-full bg-navy-900 flex items-center justify-center text-white text-xs font-black italic">
                {user?.name?.[0] || 'AD'}
             </div>
          </div>
          
          <button className="md:hidden p-2 text-slate-500">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
