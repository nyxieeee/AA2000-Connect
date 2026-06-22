import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Lock, 
  Mail, 
  ChevronRight, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@aa2000.ph');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({ id: '1', name: 'Super Admin', email, role: 'super_admin' });
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative overflow-hidden bg-slate-50/30">
        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-navy-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
             </div>
             <span className="text-xl font-bold text-navy-900 tracking-tight">AA2000 <span className="text-slate-400 font-normal">Connect</span></span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-navy-900">Enterprise Access</h1>
            <p className="text-slate-500 font-medium">Log in to your authorized AA2000 CRM console.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-medium text-sm"
                    placeholder="name@aa2000.ph"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-bold text-brand-blue hover:text-brand-light transition-colors">Forgot Password?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-blue/30 focus:border-brand-blue transition-all font-bold text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-brand-blue text-white rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-brand-light transition-all shadow-sm disabled:opacity-70 group uppercase tracking-widest text-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 flex items-center justify-between border-t border-slate-100">
             <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Authorized Personnel Only</span>
             </div>
             <div className="flex items-center gap-4 text-slate-300">
                <Globe size={16} />
                <Bot size={16} />
             </div>
          </div>
        </div>
      </div>

      {/* Right: Branding/Visual */}
      <div className="hidden lg:flex flex-1 bg-navy-900 relative items-center justify-center overflow-hidden p-20">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/5 blur-[150px] rounded-full -mr-96 -mt-96"></div>
         
         <div className="relative z-10 text-center space-y-8 max-w-lg">
            <div className="inline-block p-6 bg-white/5 border border-white/10 rounded-2xl mb-8 shadow-2xl">
               <span className="text-white font-bold text-6xl italic tracking-tighter">A</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">The Standard for Philippine Fire Safety Operations.</h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
               Intelligent infrastructure management for modern enterprise environments.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-12">
               {[
                 { label: 'Philippines', icon: Globe },
                 { label: 'Enterprise', icon: ShieldCheck },
                 { label: 'Intelligent', icon: Bot }
               ].map(item => (
                 <div key={item.label} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center gap-2">
                    <item.icon size={18} className="text-brand-blue" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
