import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ModelSelector } from '../components/ModelSelector';
import { Model } from '../types';
import { api } from '../services/api';
import { Image as ImageIcon, Sparkles, Download, Layers, RefreshCw, Wand2, Maximize2 } from 'lucide-react';

export const ImagesPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<Array<{ id: string; url: string; prompt: string; ratio: string; date: Date }>>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const modelId = selectedModel?.modelId || 'vectorengine-dall-e-3';
      const result = await api.generateImage(prompt, modelId, aspectRatio);

      const newImage = {
        id: `img_${Date.now()}`,
        url: result.imageUrl,
        prompt,
        ratio: aspectRatio,
        date: new Date(),
      };

      setGallery((prev) => [newImage, ...prev]);
      setActiveImage(result.imageUrl);
      setPrompt('');
    } catch (err: any) {
      alert(`Image Generation Failed: ${err.message || 'Error occurred'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090B] to-[#09090B] relative overflow-y-auto">
        <Header
          title="Image Studio & Diffusion Hub"
          subtitle="Generate high-fidelity AI imagery with VectorEngine Diffusion"
        />

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Control Panel */}
          <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Generative Diffusion Configuration</h3>
                  <p className="text-xs text-slate-400">Select model parameters and aspect ratio</p>
                </div>
              </div>

              <ModelSelector
                selectedModelId={selectedModel?.modelId || 'vectorengine-dall-e-3'}
                onSelectModel={(model) => setSelectedModel(model)}
                filterType="image"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Image Prompt</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image in detailed visual terms e.g., 'Futuristic cyberpunk neon control room, hyper-detailed render, 8k resolution, photorealistic lighting...'"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Aspect Ratio:</span>
                  {['1:1', '16:9', '9:16', '4:3', '3:2'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:opacity-90 cursor-pointer disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Canvas...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Visual Asset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active Generation Display & Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Preview Container */}
            <div className="lg:col-span-2 bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
              {activeImage ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="relative group max-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <img src={activeImage} alt="Generated Asset" className="max-h-[480px] object-contain rounded-2xl" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={activeImage}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>Full Size</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Visual Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Enter a prompt above and click generate to render a high-resolution diffusion image.
                  </p>
                </div>
              )}
            </div>

            {/* Generated History Grid */}
            <div className="bg-[#0F1117]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Session Gallery ({gallery.length})</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px] pr-1">
                {gallery.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-12">No images generated in this session yet.</div>
                ) : (
                  gallery.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveImage(item.url)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        activeImage === item.url
                          ? 'bg-purple-950/30 border-purple-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={item.url} alt="Thumbnail" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{item.prompt}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {item.ratio}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
