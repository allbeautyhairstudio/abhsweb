'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeliverableStatusBadge } from './deliverable-status-badge';
import { DELIVERABLE_TYPES } from '@/lib/constants/stages';
import { FileCheck, ChevronRight, ShieldAlert } from 'lucide-react';

interface Deliverable {
  id: number;
  client_id: number;
  deliverable_type: string;
  status: string;
  content: string | null;
  generated_at: string | null;
  sent_at: string | null;
  notes: string | null;
}

const STATUS_ORDER = ['not_started', 'generated', 'reviewed', 'sent'] as const;

function getNextStatus(current: string): string | null {
  const idx = STATUS_ORDER.indexOf(current as typeof STATUS_ORDER[number]);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

function getNextStatusLabel(nextStatus: string): string {
  const labels: Record<string, string> = {
    generated: 'Mark Generated',
    reviewed: 'Mark Reviewed',
    sent: 'Mark Sent',
  };
  return labels[nextStatus] ?? nextStatus;
}

export function DeliverablesTabContent({ clientId }: { clientId: number }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [raiDialogOpen, setRaiDialogOpen] = useState(false);
  const [pendingSendId, setPendingSendId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/clients/${clientId}/deliverables`);
      if (res.ok) {
        const data = await res.json();
        setDeliverables(data);
      }
      setLoading(false);
    }
    load();
  }, [clientId]);

  async function advanceStatus(deliverableId: number, newStatus: string, confirmedReview = false) {
    // RAI gate: require confirmation before marking as sent
    if (newStatus === 'sent' && !confirmedReview) {
      setPendingSendId(deliverableId);
      setRaiDialogOpen(true);
      return;
    }

    const res = await fetch(`/api/clients/${clientId}/deliverables`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliverable_id: deliverableId,
        status: newStatus,
        confirmed_review: confirmedReview,
      }),
    });

    if (res.ok) {
      setDeliverables(prev =>
        prev.map(d =>
          d.id === deliverableId ? { ...d, status: newStatus } : d
        )
      );
    }
  }

  function handleRaiConfirm() {
    if (pendingSendId !== null) {
      advanceStatus(pendingSendId, 'sent', true);
    }
    setRaiDialogOpen(false);
    setPendingSendId(null);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-sm text-muted-foreground">Loading deliverables...</p>
        </CardContent>
      </Card>
    );
  }

  if (deliverables.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <FileCheck size={32} className="mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-brand-700">No Deliverables Yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Deliverables are created when the client reaches the Analysis & Prep stage.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get completed count for progress summary
  const sentCount = deliverables.filter(d => d.status === 'sent').length;
  const reviewedCount = deliverables.filter(d => d.status === 'reviewed').length;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium text-emerald-700">{sentCount} sent</span>
            <span className="font-medium text-blue-700">{reviewedCount} reviewed</span>
            <span className="font-medium text-muted-foreground">
              {deliverables.length - sentCount - reviewedCount} remaining
            </span>
          </div>
          {/* Visual progress bar */}
          <div className="flex gap-0.5 mt-2">
            {deliverables.map((d) => (
              <div
                key={d.id}
                className={`h-2 flex-1 rounded-full ${
                  d.status === 'sent' ? 'bg-emerald-400' :
                  d.status === 'reviewed' ? 'bg-blue-400' :
                  d.status === 'generated' ? 'bg-amber-300' :
                  'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deliverable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliverables.map((d) => {
          const typeInfo = DELIVERABLE_TYPES.find(t => t.id === d.deliverable_type);
          const nextStatus = getNextStatus(d.status);

          return (
            <Card key={d.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium text-brand-700 leading-snug">
                    {typeInfo?.label ?? d.deliverable_type}
                  </CardTitle>
                  <DeliverableStatusBadge status={d.status} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end pt-0">
                {d.generated_at && (
                  <p className="text-xs text-muted-foreground">
                    Generated: {d.generated_at.slice(0, 10)}
                  </p>
                )}
                {d.sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Sent: {d.sent_at.slice(0, 10)}
                  </p>
                )}
                {nextStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full text-xs"
                    onClick={() => advanceStatus(d.id, nextStatus)}
                  >
                    {getNextStatusLabel(nextStatus)}
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                )}
                {d.status === 'sent' && (
                  <p className="text-xs text-emerald-600 font-medium mt-3 text-center">
                    Delivered
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* RAI Review Confirmation Dialog */}
      <Dialog open={raiDialogOpen} onOpenChange={setRaiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-brand-800 flex items-center gap-2">
              <ShieldAlert size={20} className="text-amber-600" />
              Review Confirmation
            </DialogTitle>
            <DialogDescription>
              Before marking this deliverable as sent to the client, please confirm:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-amber-900">
              Have you reviewed this deliverable for:
            </p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>&#x2022; Accuracy of all information and recommendations</li>
              <li>&#x2022; Appropriate tone (Section 9 guidelines)</li>
              <li>&#x2022; Personalization to this specific client</li>
              <li>&#x2022; No AI artifacts or placeholder text remaining</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setRaiDialogOpen(false); setPendingSendId(null); }}
            >
              Go Back
            </Button>
            <Button
              onClick={handleRaiConfirm}
              className="bg-primary hover:bg-brand-600"
            >
              Yes, I&apos;ve Reviewed — Mark as Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
