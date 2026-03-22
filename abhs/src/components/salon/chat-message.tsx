'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  channelContext?: string | null;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, channelContext, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = role === 'user';

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-warm-600 text-white rounded-br-md'
            : 'bg-blush-50 text-warm-800 border border-warm-100 rounded-bl-md'
        }`}
      >
        {channelContext && !isUser && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-warm-400 font-medium uppercase tracking-wide">
            {channelContext === 'both' ? 'SMS + Email Draft' : `${channelContext} Draft`}
          </div>
        )}
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-warm-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
        {!isUser && content && !isStreaming && (
          <button
            onClick={handleCopy}
            className="mt-2 inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600 transition-colors"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}
