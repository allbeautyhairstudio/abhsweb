'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, ArrowLeft, Send, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  channel_context?: string | null;
  created_at?: string;
}

interface IntakeChatPanelProps {
  clientId: number;
  clientName: string;
}

export function IntakeChatPanel({ clientId, clientName }: IntakeChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [channelContext, setChannelContext] = useState<'sms' | 'email' | 'both' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stylist notes state
  const [stylistNotes, setStylistNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat history and stylist notes when panel opens
  useEffect(() => {
    if (isOpen) {
      loadHistory();
      loadStylistNotes();
    }
  }, [isOpen, clientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function loadHistory() {
    try {
      const res = await fetch(`/api/admin/chat?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Silent fail -- empty chat is fine
    }
  }

  async function loadStylistNotes() {
    try {
      const res = await fetch(`/api/admin/stylist-notes?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setStylistNotes(data.content);
          setNotesExpanded(true);
        }
      }
    } catch {
      // Silent fail
    }
  }

  async function saveStylistNotes() {
    if (noteStatus === 'saving') return;
    setNoteStatus('saving');
    try {
      const res = await fetch('/api/admin/stylist-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, content: stylistNotes }),
      });
      setNoteStatus(res.ok ? 'saved' : 'error');
      if (res.ok) {
        setTimeout(() => setNoteStatus('idle'), 2000);
      }
    } catch {
      setNoteStatus('error');
    }
  }

  async function sendMessage(messageText: string, channel: 'sms' | 'email' | 'both' | null) {
    if (!messageText.trim() || isLoading) return;

    setInput('');
    setError(null);

    // Add user message to UI immediately
    const userMsg: Message = {
      role: 'user',
      content: messageText.trim(),
      channel_context: channel,
    };
    setMessages(prev => [...prev, userMsg]);

    // Start streaming
    setIsLoading(true);
    setIsStreaming(true);

    // Add empty assistant message that will be filled by stream
    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      channel_context: channel,
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          message: messageText.trim(),
          channelContext: channel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.done) break;
            if (data.error) {
              setError(data.error);
              break;
            }
            if (data.text) {
              fullText += data.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      // Remove empty assistant message on error
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1]?.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  function handleSend() {
    sendMessage(input, isDraftMode ? channelContext : null);
  }

  function handleDraftResponse() {
    if (!channelContext || isLoading) return;
    const channelLabel = channelContext === 'both' ? 'SMS and email' : channelContext;
    const prompt = `Draft a ${channelLabel} response to ${clientName} based on their intake submission and my stylist notes. Keep it warm, professional, and in my voice.`;
    sendMessage(prompt, channelContext);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-forest-600 text-white rounded-full shadow-lg hover:bg-forest-700 transition-colors md:bottom-6"
        aria-label="Open AI chat assistant"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">Ask AI</span>
      </button>
    );
  }

  const chatContent = (
    <>
      {/* Stylist Notes (collapsible) */}
      <div className="border-b border-warm-100">
        <button
          onClick={() => setNotesExpanded(!notesExpanded)}
          className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-warm-600 hover:bg-warm-50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileText size={14} />
            Stylist Notes
            {noteStatus === 'saving' && <span className="text-warm-400 ml-1">Saving...</span>}
            {noteStatus === 'saved' && <span className="text-forest-600 ml-1">Saved</span>}
            {noteStatus === 'error' && <span className="text-red-500 ml-1">Error</span>}
          </span>
          {notesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {notesExpanded && (
          <div className="px-4 pb-3">
            <textarea
              value={stylistNotes}
              onChange={e => setStylistNotes(e.target.value)}
              onBlur={saveStylistNotes}
              placeholder="Your technical assessment, observations, recommendations..."
              rows={3}
              className="w-full resize-none rounded-lg border border-warm-200 bg-warm-50/50 px-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-warm-400 mt-8">
            Ask me anything about this intake, or toggle Draft Mode to write a message to your client.
          </p>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            channelContext={msg.channel_context}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {error && (
          <div className="text-center text-sm text-red-500 py-2">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        isDraftMode={isDraftMode}
        setIsDraftMode={setIsDraftMode}
        channelContext={channelContext}
        setChannelContext={setChannelContext}
        isLoading={isLoading}
        onSend={handleSend}
        onDraftResponse={handleDraftResponse}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        clientName={clientName}
      />
    </>
  );

  return (
    <>
      {/* Mobile: full screen overlay */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-100 bg-blush-50/60">
          <button onClick={() => setIsOpen(false)} className="p-1" aria-label="Close chat">
            <ArrowLeft size={20} className="text-warm-600" />
          </button>
          <div>
            <p className="text-sm font-semibold text-warm-800">{clientName}</p>
            <p className="text-xs text-warm-400">AI Assistant</p>
          </div>
        </div>
        {chatContent}
      </div>

      {/* Desktop: side panel */}
      <div className="hidden md:flex md:fixed md:right-0 md:top-0 md:bottom-0 md:w-[40%] md:max-w-[480px] md:min-w-[360px] md:z-50 md:flex-col md:border-l md:border-warm-200 md:bg-white md:shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100 bg-blush-50/60">
          <div>
            <p className="text-sm font-semibold text-warm-800">{clientName}</p>
            <p className="text-xs text-warm-400">AI Assistant</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors" aria-label="Close chat">
            <X size={18} className="text-warm-500" />
          </button>
        </div>
        {chatContent}
      </div>
    </>
  );
}

/** Shared input area for both mobile and desktop layouts */
function ChatInput({
  input,
  setInput,
  isDraftMode,
  setIsDraftMode,
  channelContext,
  setChannelContext,
  isLoading,
  onSend,
  onDraftResponse,
  onKeyDown,
  inputRef,
  clientName,
}: {
  input: string;
  setInput: (v: string) => void;
  isDraftMode: boolean;
  setIsDraftMode: (v: boolean) => void;
  channelContext: 'sms' | 'email' | 'both' | null;
  setChannelContext: (v: 'sms' | 'email' | 'both' | null) => void;
  isLoading: boolean;
  onSend: () => void;
  onDraftResponse: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  clientName: string;
}) {
  return (
    <div className="border-t border-warm-100 bg-white px-4 py-3 space-y-2 safe-area-bottom">
      {/* Draft mode toggle + channel pills + draft response button */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setIsDraftMode(!isDraftMode);
            if (!isDraftMode && !channelContext) setChannelContext('sms');
          }}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            isDraftMode
              ? 'bg-forest-50 text-forest-700 border-forest-200'
              : 'text-warm-400 border-warm-200 hover:border-warm-300'
          }`}
        >
          Draft Message
        </button>
        {isDraftMode && (
          <>
            <div className="flex gap-1">
              {(['sms', 'email', 'both'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setChannelContext(ch)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    channelContext === ch
                      ? 'bg-warm-600 text-white border-warm-600'
                      : 'text-warm-500 border-warm-200 hover:border-warm-300'
                  }`}
                >
                  {ch === 'both' ? 'Both' : ch.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={onDraftResponse}
              disabled={!channelContext || isLoading}
              className="text-xs px-3 py-1 rounded-full bg-forest-600 text-white hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={`Draft a ${channelContext || ''} response to ${clientName}`}
            >
              Draft Response
            </button>
          </>
        )}
      </div>

      {/* Text input + send */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isDraftMode ? `What should the ${channelContext || 'message'} say?` : 'Ask about this intake...'}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-warm-200 bg-warm-50/50 px-3 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300"
          disabled={isLoading}
        />
        <Button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-10 w-10 rounded-xl bg-forest-600 hover:bg-forest-700 text-white shrink-0"
          aria-label="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
