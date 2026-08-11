import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Model } from '../types';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Search,
  Zap,
  MessageSquare,
  Eye,
  Image as ImageIcon,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    return matchesSearch && m.type === filterType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'chat':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> CHAT
          </span>
        );
      case 'vision':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold flex items-center gap-1">
            <Eye className="w-3 h-3" /> VISION
          </span>
        );
      case 'image':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> DIFFUSION
          </span>
        );
      case 'reasoning':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" /> REASONING
          </span>
        );
      case 'coding':
        return (
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold flex items-center gap-1">
            <Code2 className="w-3 h-3" /> CODING
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Neural Model Hub"
          subtitle="Explore available foundation models, benchmarks, and context capabilities"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search models by name or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'All Models' },
                { id: 'chat', label: 'Chat' },
                { id: 'reasoning', label: 'Reasoning' },
                { id: 'vision', label: 'Vision' },
                { id: 'image', label: 'Diffusion' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    filterType === f.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Models Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Sparkles className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-xs">Fetching model registry...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map((model) => (
                <div
                  key={model.modelId}
                  className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 group transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {model.name}
                          </h3>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">{model.modelId}</p>
                      </div>
                      {getTypeBadge(model.type)}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{model.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Context Window</span>
                        <span className="font-mono font-bold text-white">
                          {(model.contextWindow / 1024).toLocaleString()}k tokens
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Cost / 1M Tokens</span>
                        <span className="font-mono font-bold text-white">
                          ${((model.pricing?.prompt || 0.001) * 1000).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span>{model.enabled ? 'Deployed & Active' : 'Maintenance'}</span>
                    </div>

                    <button
                      onClick={() => navigate(model.type === 'image' ? '/images' : '/chat')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Deploy Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
