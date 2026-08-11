import React, { useState } from 'react';
import { api } from '../services/api';
import { Eye, Upload, X, AlertCircle, Sparkles, Check } from 'lucide-react';

interface VisionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisResult: (resultText: string, imageUrl: string) => void;
}

export const VisionUploadModal: React.FC<VisionUploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Analyze and describe this image in detail.');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (.png, .jpg, .webp).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be under 10MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.analyzeVision(selectedFile, prompt);
      onAnalysisResult(data.analysis, imagePreview || '');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Vision analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#101524] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Vision Image Inspector</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUploadAndAnalyze} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Drag/Drop or Input */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition-all bg-slate-900/50 relative">
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl object-cover border border-slate-700" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Click to upload image</span>
                <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Analysis Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !selectedFile}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing via VectorEngine Vision...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upload & Analyze Image</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
