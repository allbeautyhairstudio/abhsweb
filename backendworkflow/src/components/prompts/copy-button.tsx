'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : label}
      className={copied ? 'text-emerald-600 border-emerald-300' : ''}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span className="ml-1" aria-live="polite">{copied ? 'Copied!' : label}</span>
    </Button>
  );
}
