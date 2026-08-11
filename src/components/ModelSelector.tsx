import React, { useEffect, useState } from 'react';
import { Model } from '../types';
import { api } from '../services/api';
import { Cpu, ChevronDown, Check, Zap, Sparkles, Code, Eye, Image } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: Model) => void;
  filterType?: 'chat' | 'image' | 'vision' | 'all';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  filterType = 'all',
}) => {
  const [models, setModels] = useState<Model[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await api.getModels();
        const enabledModels = data.filter((m) => m.enabled);
        setModels(enabledModels);

        if (enabledModels.length > 0 && (!selectedModelId || !enabledModels.find((m) => m.modelId === selectedModelId))) {
          onSelectModel(enabledModels[0]);
        }
      } catch (err) {
        console.error('Failed to load dynamic model catalogue:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels = models.filter((m) => {
    if (filterType === 'all') return true;
    if (filterType === 'image') return m.capabilities.includes('image');
    if (filterType === 'vision') return m.capabilities.includes('vision');
    if (filterType === 'chat') return m.capabilities.includes('chat') || m.capabilities.includes('coding');
    return true;
  });

  const selectedModel = models.find((m) => m.modelId === selectedModelId) || filteredModels[0];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code className="w-3.5 h-3.5 text-blue-400" />;
      case 'vision':
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case 'image':
        return <Image className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121726] hover:bg-[#182035] border border-slate-700/70 text-slate-200 text-xs font-semibold shadow-lg shadow-black/20 transition-all cursor-pointer"
      >
        <Cpu className="w-4 h-4 text-blue-400" />
        <span className="text-white font-medium">{selectedModel ? selectedModel.name : 'Select Model'}</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-500/30">
          {selectedModel?.modelId || selectedModelId}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#121728] border border-slate-700/80 shadow-2xl shadow-blue-950/50 z-50 overflow-hidden backdrop-blur-xl">
            <div className="p-3 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>VectorEngine Catalog</span>
              <span className="text-blue-400 text-[10px] font-mono">{filteredModels.length} models active</span>
            </div>

            <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-slate-400">Fetching dynamic models...</div>
              ) : filteredModels.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No matching models found.</div>
              ) : (
                filteredModels.map((m) => {
                  const isSelected = m.modelId === selectedModel?.modelId;
                  return (
                    <button
                      key={m._id || m.modelId}
                      onClick={() => {
                        onSelectModel(m);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium text-xs text-white">
                          {getTypeIcon(m.type)}
                          <span>{m.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{m.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {m.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
