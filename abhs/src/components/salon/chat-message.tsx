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
  const isDraft = !isUser && !!channelContext;

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Draft preview card styling for assistant messages with channel context
  if (isDraft) {
    const channelLabel =
      channelContext === 'both' ? 'SMS + Email Draft' :
      channelContext === 'sms' ? 'SMS Draft' :
      'Email Draft';

    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] w-full rounded-xl border-2 border-sage-200 bg-sage-50/60 px-4 py-3 text-sm leading-relaxed">
          {/* Channel badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sage-200 text-sage-800 uppercase tracking-wide">
              {channelLabel}
            </span>
            {content && !isStreaming && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-sage-600 hover:bg-sage-200 transition-colors"
                aria-label="Copy draft to clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {/* Draft content */}
          <div className="whitespace-pre-wrap text-warm-800">{content}</div>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-sage-400 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    );
  }

  // Regular message bubble
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-warm-600 text-white rounded-br-md'
            : 'bg-blush-50 text-warm-800 border border-warm-100 rounded-bl-md'
        }`}
      >
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
