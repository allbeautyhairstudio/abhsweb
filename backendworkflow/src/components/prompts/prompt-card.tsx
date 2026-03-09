'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from './copy-button';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface PromptCardProps {
  promptCode: string;
  promptText: string;
  templateName: string;
  templateDescription: string;
  timeEstimate: string;
  isReady: boolean;
  missingDependency?: string;
  hasUnfilledPlaceholders: boolean;
  aiOutput: string | null;
  onSaveAiOutput: (promptCode: string, output: string) => Promise<void>;
}

export function PromptCard({
  promptCode,
  promptText,
  templateName,
  templateDescription,
  timeEstimate,
  isReady,
  missingDependency,
  hasUnfilledPlaceholders,
  aiOutput,
  onSaveAiOutput,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPasteBack, setShowPasteBack] = useState(false);
  const [pasteValue, setPasteValue] = useState(aiOutput ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!pasteValue.trim()) return;
    setSaving(true);
    await onSaveAiOutput(promptCode, pasteValue);
    setSaving(false);
  }

  return (
    <Card className={!isReady ? 'opacity-75 border-amber-200' : ''}>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-sm font-medium">{promptCode}: {templateName}</CardTitle>
            {aiOutput && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} /> Completed
              </span>
            )}
            {!isReady && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle size={12} /> Needs {missingDependency} output
              </span>
            )}
            {hasUnfilledPlaceholders && isReady && !aiOutput && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Clock size={12} /> Has fill-in fields
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeEstimate}</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{templateDescription}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex justify-end mb-2">
            <CopyButton text={promptText} label="Copy Prompt" />
          </div>
          <pre className="bg-muted p-4 rounded-lg text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
            {promptText}
          </pre>

          {/* Paste-back section */}
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => setShowPasteBack(!showPasteBack)}>
              {showPasteBack ? 'Hide' : aiOutput ? 'View/Edit AI Response' : 'Paste AI Response (optional)'}
            </Button>
            {showPasteBack && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  placeholder="Paste the AI response here for storage..."
                  className="min-h-[120px] text-xs font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !pasteValue.trim()}
                >
                  {saving ? 'Saving...' : 'Save Response'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
