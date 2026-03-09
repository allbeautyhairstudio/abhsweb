import { PROMPT_TEMPLATES, PROMPT_CATEGORIES } from '@/lib/constants/prompt-templates';
import { PromptLibrary } from '@/components/prompts/prompt-library';

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Prompt Library</h1>
        <p className="text-muted-foreground mt-1">
          Reference view of all {PROMPT_TEMPLATES.length} templates — not client-specific.
          For auto-populated prompts, open a client&apos;s Prompts tab.
        </p>
      </div>

      <PromptLibrary templates={PROMPT_TEMPLATES} categories={PROMPT_CATEGORIES} />
    </div>
  );
}
