'use client';

import { useEffect, useState, useCallback } from 'react';
import { RaiBanner } from './rai-banner';
import { PromptCard } from './prompt-card';
import { PROMPT_TEMPLATES, PROMPT_CATEGORIES } from '@/lib/constants/prompt-templates';
import { Loader2 } from 'lucide-react';

interface PromptData {
  prompt_code: string;
  populated_prompt: string;
  is_ready: boolean;
  missing_dependency?: string;
  has_unfilled_placeholders: boolean;
  ai_output: string | null;
  generated_at: string | null;
}

export function PromptsTabContent({ clientId }: { clientId: number }) {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/prompts`);
      if (!res.ok) throw new Error('Failed to fetch prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  async function handleSaveAiOutput(promptCode: string, output: string) {
    const res = await fetch(`/api/clients/${clientId}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_code: promptCode, ai_output: output }),
    });
    if (res.ok) {
      // Refresh to update chain dependencies
      await fetchPrompts();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 size={16} className="animate-spin" />
        Generating prompts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RaiBanner />

      {PROMPT_CATEGORIES.map(cat => {
        const categoryPrompts = prompts.filter(p => {
          const template = PROMPT_TEMPLATES.find(t => t.code === p.prompt_code);
          return template?.category === cat.id;
        });
        if (categoryPrompts.length === 0) return null;

        return (
          <div key={cat.id}>
            <h3 className="text-lg font-semibold text-brand-800 mb-1">
              Tier {cat.tier}: {cat.label}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
            <div className="space-y-2">
              {categoryPrompts.map(p => {
                const template = PROMPT_TEMPLATES.find(t => t.code === p.prompt_code);
                if (!template) return null;
                return (
                  <PromptCard
                    key={p.prompt_code}
                    promptCode={p.prompt_code}
                    promptText={p.populated_prompt}
                    templateName={template.name}
                    templateDescription={template.description}
                    timeEstimate={template.time_estimate}
                    isReady={p.is_ready}
                    missingDependency={p.missing_dependency}
                    hasUnfilledPlaceholders={p.has_unfilled_placeholders}
                    aiOutput={p.ai_output}
                    onSaveAiOutput={handleSaveAiOutput}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
