import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ModelSelector } from '../components/ModelSelector';
import { ChatMessage } from '../components/ChatMessage';
import { PromptTemplatesModal } from '../components/PromptTemplatesModal';
import { VisionUploadModal } from '../components/VisionUploadModal';
import { Model, ChatMessage as ChatMessageType, Conversation } from '../types';
import { api } from '../services/api';
import {
  Send,
  Plus,
  Trash2,
  Bookmark,
  Eye,
  RefreshCw,
  Square,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modals
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
        setMessages(data[0].messages || []);
      }
    } catch (err) {
      console.warn('Conversations require authenticated user account or local storage fallback');
    }
  };

  const handleNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setInputPrompt('');
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setMessages(conv.messages || []);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversation?._id === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (overridePrompt?: string, imageUrl?: string) => {
    const textToSend = overridePrompt || inputPrompt;
    if (!textToSend.trim() && !imageUrl) return;

    const modelId = selectedModel?.modelId || 'vectorengine-gpt-4o';

    const userMessage: ChatMessageType = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      imageUrl,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsGenerating(true);

    const assistantPlaceholder: ChatMessageType = {
      id: `asst_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages([...updatedMessages, assistantPlaceholder]);

    try {
      // Use SSE Streaming Chat from Node.js backend
      let streamedText = '';
      await api.streamChat(
        modelId,
        updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        (chunkToken) => {
          streamedText += chunkToken;
          setMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (next[lastIdx] && next[lastIdx].role === 'assistant') {
              next[lastIdx] = { ...next[lastIdx], content: streamedText };
            }
            return next;
          });
        },
        async () => {
          setIsGenerating(false);
          // Persist conversation to DB if logged in
          const finalMessages = [...updatedMessages, { ...assistantPlaceholder, content: streamedText }];
          try {
            if (activeConversation?._id) {
              await api.updateConversation(activeConversation._id, { messages: finalMessages });
            } else {
              const title = textToSend.slice(0, 30) || 'New AI Session';
              const newConv = await api.createConversation(title, modelId, userMessage);
              setActiveConversation(newConv);
              loadConversations();
            }
          } catch (persistErr) {
            // Unauthenticated sessions remain in local React state
          }
        },
        (errorMsg) => {
          setIsGenerating(false);
          setMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (next[lastIdx]) {
              next[lastIdx] = {
                ...next[lastIdx],
                content: `⚠️ **VectorEngine Error:** ${errorMsg}`,
              };
            }
            return next;
          });
        }
      );
    } catch (err: any) {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVisionAnalysis = (resultText: string, imgUrl: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `usr_vis_${Date.now()}`,
        role: 'user',
        content: 'Analyzed uploaded image file.',
        imageUrl: imgUrl,
        timestamp: new Date(),
      },
      {
        id: `asst_vis_${Date.now()}`,
        role: 'assistant',
        content: resultText,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative">
        <Header
          title="VectorEngine AI Studio"
          subtitle="Real-time multi-model chat workspace"
          activeModelName={selectedModel?.name}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Inner Conversations Sidebar */}
          <div className="w-64 bg-[#0F1117] border-r border-slate-800 flex flex-col p-3 hidden md:flex shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer transition-all mb-4"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Recent Chats
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {conversations.length === 0 ? (
                <div className="text-xs text-slate-500 px-2 py-4 text-center">No previous sessions</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      activeConversation?._id === conv._id
                        ? 'bg-blue-600/15 border border-blue-500/30 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Stream Container */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {/* Model Selector Bar */}
            <div className="p-3 px-6 bg-[#0F1117]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
              <ModelSelector
                selectedModelId={selectedModel?.modelId || 'vectorengine-gpt-4o'}
                onSelectModel={(model) => setSelectedModel(model)}
                filterType="chat"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPromptModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>Prompts</span>
                </button>

                <button
                  onClick={() => setIsVisionModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vision Upload</span>
                </button>
              </div>
            </div>

            {/* Chat Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">How can VectorEngine assist you today?</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Powered by VectorEngine's custom OpenAI-compatible server architecture. Choose a model to start generating code, reasoning, or analyzing data.
                    </p>
                  </div>

                  {/* Starter Suggestions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                    {[
                      {
                        title: 'Build Express AI Proxy',
                        desc: 'Generate low-latency Node.js streaming route with rate limits',
                      },
                      {
                        title: 'Architect Microservice RAG',
                        desc: 'Design vector search retrieval pipeline on VectorEngine embeddings',
                      },
                      {
                        title: 'Debug React Typescript',
                        desc: 'Refactor complex generic state hook with strict error boundaries',
                      },
                      {
                        title: 'Analyze Deep Math Proof',
                        desc: 'Break down complex reasoning step-by-step with reasoning model',
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.desc)}
                        className="p-3.5 rounded-2xl bg-[#0F1117] border border-slate-800 hover:border-blue-500/50 text-left transition-all hover:bg-slate-900 cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage key={msg.id || idx} message={msg} modelName={selectedModel?.name} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 bg-[#09090B]/90 border-t border-slate-800/80 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto">
                <div className="relative rounded-2xl bg-[#0F1117] border border-slate-800 focus-within:border-blue-500/60 transition-all shadow-xl p-2.5">
                  <textarea
                    rows={2}
                    placeholder={`Message ${selectedModel?.name || 'VectorEngine'}... (Shift+Enter for new line)`}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 px-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>{selectedModel?.modelId || 'vectorengine-gpt-4o'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isGenerating || !inputPrompt.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-opacity shadow-md shadow-blue-500/20"
                    >
                      {isGenerating ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-white animate-spin" />
                          <span>Streaming...</span>
                        </>
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <PromptTemplatesModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          onSelectPrompt={(pText) => handleSendMessage(pText)}
        />

        <VisionUploadModal
          isOpen={isVisionModalOpen}
          onClose={() => setIsVisionModalOpen(false)}
          onAnalysisResult={handleVisionAnalysis}
        />
      </main>
    </div>
  );
};
