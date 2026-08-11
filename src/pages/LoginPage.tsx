import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickAuth = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="min-h-screen bg-[#090c15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#101524]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 items-center justify-center shadow-xl shadow-blue-500/20 mb-2">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">VectorEngine AI</h1>
          <p className="text-xs text-slate-400">Production-Ready Neural Engine Platform</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Credentials Box for Demo Ease */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Demo Credentials (1-Click Fill)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAuth('admin@vectorengine.ai', 'adminpassword123')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>Admin User</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAuth('demo@vectorengine.ai', 'demopassword123')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/50 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <UserCheck className="w-3 h-3 text-blue-400" />
              <span>Standard User</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to VectorEngine</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
