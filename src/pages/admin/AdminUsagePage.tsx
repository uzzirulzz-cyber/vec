import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { DollarSign, Zap, BarChart3, TrendingUp, PieChart, Layers } from 'lucide-react';

export const AdminUsagePage: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Token Billing & Infrastructure Usage"
          subtitle="Enterprise token consumption, cost breakdown, and cloud compute metrics"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Current Month Spend
              </span>
              <h3 className="text-3xl font-black text-white">$4,120.40</h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Under enterprise monthly quota ($10,000 max)</span>
              </p>
            </div>

            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Total Token Volume
              </span>
              <h3 className="text-3xl font-black text-white">412.8M Tokens</h3>
              <p className="text-xs text-slate-400">84.2% Chat / 15.8% Vision & Diffusion</p>
            </div>

            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Cost Per Million Tokens
              </span>
              <h3 className="text-3xl font-black text-white">$0.0099 avg</h3>
              <p className="text-xs text-blue-400">Optimized via VectorEngine Proxy Cache</p>
            </div>
          </div>

          {/* Model Breakdown Progress Bars */}
          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>Token Consumption by Foundation Model</span>
            </h4>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-white">VE-Titan-3.5-Turbo (GPT-4o)</span>
                  <span className="text-blue-400 font-mono">214.2M tokens ($2,142)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[52%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-white">VE-Nexus-Coder (Gemini Pro)</span>
                  <span className="text-purple-400 font-mono">118.4M tokens ($1,065)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[28%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-white">VE-Visionary-Pro (Sonnet 3.5)</span>
                  <span className="text-cyan-400 font-mono">54.1M tokens ($649)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[13%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-white">VE-Diffusion-XL (DALL-E 3)</span>
                  <span className="text-amber-400 font-mono">26.1M tokens ($264)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[7%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
