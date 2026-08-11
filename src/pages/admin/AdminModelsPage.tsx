import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AdminModelsPage: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<any | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await api.getAdminModels();
      setModels(data);
    } catch (err) {
      console.error('Error loading admin models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailable = async (model: any) => {
    try {
      const updated = await api.updateAdminModel(model.modelId, {
        enabled: !model.enabled,
      });
      setModels((prev) =>
        prev.map((m) => (m.modelId === model.modelId ? updated : m))
      );
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Model Deployment Management"
          subtitle="Configure rate limits, context window, availability, and pricing per model"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Deployed Neural Registry ({models.length})
            </h3>
            <button
              onClick={() => alert('New model provisioning pipeline initiated.')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy New Model</span>
            </button>
          </div>

          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 font-semibold">Model Name & ID</th>
                  <th className="p-4 font-semibold">Provider</th>
                  <th className="p-4 font-semibold">Task Type</th>
                  <th className="p-4 font-semibold">Context Window</th>
                  <th className="p-4 font-semibold">RPM Limit</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {models.map((m) => (
                  <tr key={m.modelId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{m.modelId}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{m.provider}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        {m.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {(m.contextWindow / 1024).toLocaleString()}k
                    </td>
                    <td className="p-4 font-mono text-slate-300">{m.rpm} RPM</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailable(m)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border ${
                          m.enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {m.enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{m.enabled ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Edit config for ${m.name}`)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
