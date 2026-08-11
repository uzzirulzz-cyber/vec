import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Cpu,
  Bookmark,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Sliders,
  Users,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#0d111c] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
              VectorEngine
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-blue-400/80 font-semibold">
              AI Platform v1.0
            </p>
          </div>
        </div>

        {/* Workspace Nav */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Workspace
          </div>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>AI Chat</span>
          </NavLink>

          <NavLink
            to="/images"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Image Studio</span>
          </NavLink>

          <NavLink
            to="/models"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Model Catalog</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>History</span>
          </NavLink>
        </div>

        {/* Admin Navigation Section */}
        {isAdmin && (
          <div className="px-3 py-2 space-y-1 border-t border-slate-800/60 mt-2 pt-3">
            <div className="px-3 text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>

            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Analytics Overview</span>
            </NavLink>

            <NavLink
              to="/admin/models"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Model Manager</span>
            </NavLink>

            <NavLink
              to="/admin/logs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>API Monitor Logs</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>User Directory</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-[#0a0d17]">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </NavLink>

        {user ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <NavLink
              to="/login"
              className="text-center py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
            >
              Log In
            </NavLink>
            <NavLink
              to="/register"
              className="text-center py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Sign Up
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};
