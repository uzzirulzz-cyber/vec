import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Layers,
  Cpu,
  Database,
  ShieldAlert,
  Download,
  Filter,
  CheckCircle2,
  DollarSign,
  Users,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, modelsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminModels(),
      ]);
      setStats(statsRes);
      setModels(modelsRes);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        {/* Sleek Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-[#0F1117]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Platform Status</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 font-mono">v2.4.0-stable</div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-md shadow-lg shadow-white/10 hover:bg-slate-200 cursor-pointer transition-colors"
            >
              Refresh Metrics
            </button>
          </div>
        </header>

        {/* Top Metric Cards (4 Grid) */}
        <section className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-xl">
            <p className="text-xs text-slate-500 font-semibold mb-1">API Requests (24h)</p>
            <h3 className="text-2xl font-bold text-white">
              {stats?.totalRequests ? `${(stats.totalRequests / 1000000).toFixed(2)}M` : '1.24M'}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>12%</span>
              <span className="text-slate-600 ml-1">vs prev day</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-xl">
            <p className="text-xs text-slate-500 font-semibold mb-1">Avg. Latency</p>
            <h3 className="text-2xl font-bold text-white">{stats?.avgLatencyMs || 142}ms</h3>
            <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs">
              <TrendingDown className="w-3 h-3" />
              <span>4.2%</span>
              <span className="text-slate-600 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-xl">
            <p className="text-xs text-slate-500 font-semibold mb-1">Token Utilization</p>
            <h3 className="text-2xl font-bold text-white">{stats?.tokenUtilization || '84.2'}%</h3>
            <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-[84%]" />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-xl">
            <p className="text-xs text-slate-500 font-semibold mb-1">Active Users</p>
            <h3 className="text-2xl font-bold text-white">
              {stats?.activeUsers ? stats.activeUsers.toLocaleString() : '4,129'}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-ping" />
              <span>Real-time monitor</span>
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <section className="px-8 pb-8 gap-6 flex flex-col lg:flex-row">
          {/* Active Model Deployments Table */}
          <div className="flex-[2] bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <Zap className="w-5 h-5 text-blue-500" />
                <span>Active Model Deployment</span>
              </h4>
              <div className="flex gap-2">
                <button className="px-2.5 py-1 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-semibold cursor-pointer hover:bg-slate-700">
                  Filter
                </button>
                <button className="px-2.5 py-1 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-semibold cursor-pointer hover:bg-slate-700">
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 font-semibold">Model Identity</th>
                    <th className="pb-3 font-semibold">Task Type</th>
                    <th className="pb-3 font-semibold">Utilization</th>
                    <th className="pb-3 font-semibold">Health</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-800/50">
                  {models.length > 0 ? (
                    models.slice(0, 5).map((m: any) => (
                      <tr key={m._id || m.modelId}>
                        <td className="py-4">
                          <div className="font-bold text-white text-xs">{m.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{m.modelId}</div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              m.type === 'chat'
                                ? 'bg-blue-500/10 text-blue-400'
                                : m.type === 'vision'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {m.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-xs text-slate-300">
                          {m.rpm ? `${(m.rpm / 100).toFixed(1)}k req/h` : '42.1k req/h'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                            <span className="text-emerald-500 text-xs">Stable</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-4">
                          <div className="font-bold text-white text-xs">VE-Titan-3.5-Turbo</div>
                          <div className="text-[11px] font-mono text-slate-500">ve_titan_35t_v1</div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">
                            CHAT
                          </span>
                        </td>
                        <td className="py-4 font-mono text-xs">42.1k req/h</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                            <span className="text-emerald-500 text-xs">Stable</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-4">
                          <div className="font-bold text-white text-xs">VE-Visionary-Pro</div>
                          <div className="text-[11px] font-mono text-slate-500">ve_vis_24_pro</div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded">
                            VISION
                          </span>
                        </td>
                        <td className="py-4 font-mono text-xs">18.4k req/h</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                            <span className="text-emerald-500 text-xs">Stable</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-4">
                          <div className="font-bold text-white text-xs">VE-Nexus-Coder</div>
                          <div className="text-[11px] font-mono text-slate-500">ve_coder_v2</div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded">
                            CODING
                          </span>
                        </td>
                        <td className="py-4 font-mono text-xs">31.0k req/h</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                            <span className="text-emerald-500 text-xs">Stable</span>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: System Resources & Usage Limits */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Resources</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">GPU Clusters (A100)</span>
                    <span className="text-white font-mono">82%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[82%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Context Memory</span>
                    <span className="text-white font-mono">45%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[45%] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Database IOPS</span>
                    <span className="text-white font-mono">21%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[21%] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Node Engine</span>
                  <span className="text-xs text-white font-mono">v20.11.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Auth Driver</span>
                  <span className="text-xs text-white font-mono">JWT-AES-256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">DB Replica</span>
                  <span className="text-xs text-white font-mono">Primary (M10)</span>
                </div>
              </div>
            </div>

            <div className="h-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Usage Limits</div>
                <div className="text-xl font-bold text-white">Enterprise Tier</div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white">
                  $4,120 <span className="text-sm font-normal opacity-70 text-white">/mo</span>
                </div>
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
