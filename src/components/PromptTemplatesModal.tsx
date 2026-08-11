import React, { useEffect, useState } from 'react';
import { PromptTemplate } from '../types';
import { api } from '../services/api';
import { Bookmark, X, Search, Sparkles, Plus, Code, Briefcase, Megaphone, PenTool, SearchCode, BarChart } from 'lucide-react';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  
  // New prompt form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Coding');
  const [newPromptText, setNewPromptText] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  const loadPrompts = async () => {
    try {
      const data = await api.getPrompts();
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompt library:', err);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPromptText) return;

    try {
      await api.createPrompt({
        name: newName,
        category: newCategory,
        prompt: newPromptText,
        isPublic: true,
      });
      setNewName('');
      setNewPromptText('');
      setIsCreating(false);
      loadPrompts();
    } catch (err) {
      console.error('Failed to save prompt:', err);
    }
  };

  if (!isOpen) return null;

  const categories = ['All', 'Coding', 'Business', 'Marketing', 'Writing', 'Research', 'Analysis'];

  const filteredPrompts = prompts.filter((p) => {
    const matchesCat = category === 'All' || p.category === category;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#101524] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Prompt Template Library</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action & Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0d101d] space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Cancel' : 'New Template'}</span>
            </button>
          </div>

          {/* Category Tabs */}
          {!isCreating && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {isCreating ? (
            <form onSubmit={handleCreatePrompt} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refactor React Hook"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Prompt Text</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write prompt content..."
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Save Prompt Template
              </button>
            </form>
          ) : filteredPrompts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No matching prompt templates found.</div>
          ) : (
            filteredPrompts.map((p) => (
              <div
                key={p._id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-500/30">
                      {p.category}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectPrompt(p.prompt);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Use Prompt</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono bg-[#090c15] p-2.5 rounded-lg border border-slate-800 line-clamp-3">
                  {p.prompt}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
