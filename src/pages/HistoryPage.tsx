import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Conversation } from '../types';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Trash2, ArrowRight, Search, Sparkles } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.warn('Could not load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Conversation Archive"
          subtitle="Search, resume, or manage historical AI inference interactions"
        />

        <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search chat history by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0F1117] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-slate-500 text-xs">Loading sessions...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Conversations Found</h3>
              <p className="text-xs text-slate-500">
                You have no stored AI conversation sessions matching your criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => navigate('/chat')}
                  className="p-4 bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {conv.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="font-mono">{conv.model}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{conv.messages?.length || 0} messages</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, conv._id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
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
