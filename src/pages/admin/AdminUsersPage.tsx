import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { Users, Shield, UserCheck, Mail, Calendar, Key } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="User Account & Organization Directory"
          subtitle="Manage user roles, organization tier permissions, and rate limit quotas"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Registered</th>
                  <th className="p-4 font-semibold text-right">API Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-bold text-white">{u.name}</span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-mono text-[11px] text-slate-500">
                      {u.apiKey ? `${u.apiKey.slice(0, 10)}...` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
