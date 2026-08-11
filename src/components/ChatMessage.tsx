import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../types';
import { User, Zap, Copy, Check, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  modelName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, modelName }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isUser = message.role === 'user';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`py-5 px-4 md:px-6 transition-all ${
        isUser
          ? 'bg-transparent'
          : 'bg-[#101524]/60 border-y border-slate-800/40 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-200">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header info */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {isUser ? 'You' : 'VectorEngine AI'}
            </span>
            {!isUser && modelName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 font-mono border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {modelName}
              </span>
            )}
            {message.timestamp && (
              <span className="text-[10px] text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Image attachment if any */}
          {message.imageUrl && (
            <div className="mt-2 mb-3 max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-xl">
              <img src={message.imageUrl} alt="Uploaded attachment" className="w-full object-cover max-h-72" />
            </div>
          )}

          {/* Text / Markdown Render */}
          <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    return (
                      <div className="relative my-3 rounded-xl bg-[#090c15] border border-slate-800 overflow-hidden font-mono text-xs">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[#0e1322] border-b border-slate-800 text-slate-400 text-[11px]">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => copyToClipboard(codeString)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-slate-200">{children}</pre>
                      </div>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
