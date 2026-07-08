import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  ChevronRight,
  ShieldCheck,
  Globe,
  Bot,
  Flame,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore, DEMO_ACCOUNTS, type UserRole } from '../../stores/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@aa2000.ph');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const account = DEMO_ACCOUNTS.find((a) => a.user.role === role);
    if (account) {
      setEmail(account.user.email);
    }
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));

    const account = DEMO_ACCOUNTS.find((a) => a.user.role === selectedRole);
    if (!account) {
      setLoading(false);
      setError('Invalid account. Select a valid role.');
      return;
    }

    if (password.length < 4) {
      setLoading(false);
      setError('Password must be at least 4 characters.');
      return;
    }

    setSuccess(true);
    login(account.user);

    // Transition delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0A192F 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full mx-auto space-y-8 relative z-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-brand-blue to-navy-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20"
            >
              <Flame className="text-white" size={22} />
            </motion.div>
            <div>
              <span className="text-xl font-bold text-navy-900 tracking-tight">AA2000</span>
              <span className="text-xl text-slate-300 font-light ml-1.5">Connect</span>
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-navy-900 tracking-tight normal-case">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Sign in to your CRM console to manage operations.
            </p>
          </motion.div>

          {/* Role Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="space-y-2"
          >
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={12} />
              Sign in as
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.user.role}
                  type="button"
                  onClick={() => handleRoleSelect(acct.user.role)}
                  className={`relative px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                    selectedRole === acct.user.role
                      ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20 scale-[1.02]'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-brand-blue/30 hover:text-navy-900 hover:bg-white'
                  }`}
                >
                  {selectedRole === acct.user.role && (
                    <motion.div
                      layoutId="roleIndicator"
                      className="absolute inset-0 bg-brand-blue rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{acct.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Enterprise Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue focus:bg-white transition-all font-medium text-sm"
                  placeholder="name@aa2000.ph"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-brand-blue hover:text-brand-light transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue focus:bg-white transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="text-rose-500 text-xs font-medium bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-navy-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-brand-blue/20 transition-all duration-300 disabled:opacity-70 group uppercase tracking-widest text-xs relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Access Granted</span>
                  </motion.div>
                ) : loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 relative z-10"
                  >
                    <span>Sign In</span>
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-6 flex items-center justify-between border-t border-slate-100"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                Authorized Personnel Only
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <Globe size={16} />
              <Bot size={16} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right: Premium branding panel */}
      <div className="hidden lg:flex flex-1 bg-navy-900 relative items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/8 blur-[150px] rounded-full -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/5 blur-[120px] rounded-full -ml-64 -mb-64" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 text-center space-y-8 max-w-lg px-12"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/5 border border-white/10 rounded-3xl mb-4 backdrop-blur-sm shadow-2xl"
          >
            <Flame className="text-brand-blue" size={42} />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight tracking-tight normal-case"
          >
            The Standard for Philippine{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Fire Safety
            </span>{' '}
            Operations.
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-lg text-slate-400 font-medium leading-relaxed normal-case"
          >
            Intelligent CRM infrastructure powering modern enterprise environments across the Philippines.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-8"
          >
            {[
              { value: '500+', label: 'Clients' },
              { value: '25+', label: 'Years' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white/10 transition-all duration-500 group"
              >
                <div className="text-2xl font-bold text-white group-hover:text-brand-blue transition-colors">
                  {stat.value}
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 pt-4"
          >
            {['AI-Powered', 'Real-Time Sync', 'Enterprise Security', 'Multi-Role Access'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
