import React, { useEffect, useState } from 'react';
import { Shield, Activity, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  activeModelName?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, activeModelName }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.checkHealth();
        setIsOnline(health.success && health.status === 'online');
      } catch (err) {
        setIsOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-6 bg-[#0b0e18]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
          {user?.role === 'admin' && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-900/60 border border-purple-500/40 rounded-full flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-purple-400" /> Admin Mode
            </span>
          )}
        </h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {activeModelName && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-xs font-medium text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Model:</span> {activeModelName}
          </div>
        )}

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
            isOnline
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <Activity className="w-3 h-3" />
          <span>VectorEngine API: {isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};
