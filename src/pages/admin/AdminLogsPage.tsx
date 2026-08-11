import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { Terminal, RefreshCw, Filter, Search, ShieldCheck } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getAdminLogs();
      setLogs(data?.logs || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.statusCode.toString().includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Inference Request Stream & API Logs"
          subtitle="Real-time telemetry, HTTP response codes, latency metrics, and payload sizes"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between gap-4 bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter logs by model ID, endpoint, status code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log Buffer</span>
            </button>
          </div>

          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3.5 font-semibold">Timestamp</th>
                  <th className="p-3.5 font-semibold">Endpoint</th>
                  <th className="p-3.5 font-semibold">Model ID</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Tokens</th>
                  <th className="p-3.5 font-semibold text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 font-bold text-white">{log.endpoint}</td>
                    <td className="p-3.5 text-blue-400">{log.modelId}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode === 200
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.statusCode} OK
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{log.tokensUsed}</td>
                    <td className="p-3.5 text-right font-bold text-slate-300">{log.latencyMs}ms</td>
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
