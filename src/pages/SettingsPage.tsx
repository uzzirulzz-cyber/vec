import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  Key,
  Shield,
  Zap,
  Save,
  CheckCircle2,
  Sliders,
  User,
  Cpu,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('ve_sk_prod_9981249120491823901923');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are VectorEngine AI, an ultra-capable production neural assistant.'
  );
  const [defaultModel, setDefaultModel] = useState('vectorengine-gpt-4o');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Engine Configuration"
          subtitle="Manage API keys, default neural model parameters, and account settings"
        />

        <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* User Account Info Card */}
          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{user?.name || 'Authenticated User'}</h3>
                <p className="text-xs text-slate-400">{user?.email || 'user@vectorengine.ai'}</p>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase">
                  {user?.role || 'Enterprise User'}
                </div>
              </div>
            </div>

            <div className="text-right border-l border-slate-800 pl-6 hidden sm:block">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                Platform Plan
              </span>
              <span className="text-sm font-bold text-white">Enterprise Tier ($4,120/mo)</span>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* API Key Box */}
            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Key className="w-4 h-4 text-blue-400" />
                <span>VectorEngine API Credentials</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Primary Secret API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Use this secret key to authenticate custom backend microservice requests against `/api/v1/chat/completions`.
                </p>
              </div>
            </div>

            {/* Model Defaults */}
            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>System Directive & Model Preferences</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Default Studio Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="vectorengine-gpt-4o">VE-Titan-3.5-Turbo (OpenAI GPT-4o Compatible)</option>
                  <option value="vectorengine-claude-3-5-sonnet">VE-Visionary-Pro (Anthropic Sonnet Compatible)</option>
                  <option value="vectorengine-gemini-1-5-pro">VE-Nexus-Coder (Google Gemini Pro Compatible)</option>
                  <option value="vectorengine-deepseek-r1">VE-DeepMind-R1 (DeepSeek R1 Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Global System Instruction</label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSaved ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings successfully saved!</span>
                </div>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-90 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
