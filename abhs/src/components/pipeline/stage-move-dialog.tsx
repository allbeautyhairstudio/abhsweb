'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PIPELINE_STAGES, STAGE_CHECKLISTS } from '@/lib/constants/stages';
import type { PipelineStage } from '@/lib/constants/stages';

interface StageMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientId: number;
  currentStage: string;
  targetStage: string;
  direction: 'forward' | 'backward';
  onConfirm: () => void;
}

export function StageMoveDialog({
  open,
  onOpenChange,
  clientName,
  currentStage,
  targetStage,
  direction,
  onConfirm,
}: StageMoveDialogProps) {
  const [loading, setLoading] = useState(false);
  const currentLabel = PIPELINE_STAGES.find(s => s.id === currentStage)?.label ?? currentStage;
  const targetLabel = PIPELINE_STAGES.find(s => s.id === targetStage)?.label ?? targetStage;
  const isBackward = direction === 'backward';

  // For forward moves, show current stage checklist (finish before advancing)
  // For backward moves, show target stage checklist (what they're going back to)
  const checklistStage = isBackward ? targetStage : currentStage;
  const checklist = STAGE_CHECKLISTS[checklistStage as PipelineStage] ?? [];

  async function handleConfirm() {
    setLoading(true);
    try {
      onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={isBackward ? 'text-amber-700' : 'text-brand-800'}>
            {isBackward ? 'Move Client Back' : 'Move Client Forward'}
          </DialogTitle>
          <DialogDescription>
            Moving <strong>{clientName}</strong> from{' '}
            <strong>{currentLabel}</strong> to <strong>{targetLabel}</strong>
          </DialogDescription>
        </DialogHeader>

        {isBackward && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              This will move the client back to a previous stage.
            </p>
          </div>
        )}

        {checklist.length > 0 && (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium text-brand-700 mb-2">
              {isBackward
                ? `Checklist for ${targetLabel}:`
                : `Checklist for ${currentLabel}:`
              }
            </p>
            <ul className="space-y-1.5">
              {checklist.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-0.5">&#x2022;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!isBackward && (
              <p className="text-xs text-muted-foreground/70 mt-3 italic">
                Make sure these are done before advancing.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={isBackward ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-brand-600'}
          >
            {loading ? 'Moving...' : `Move to ${targetLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
