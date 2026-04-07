'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IntakeDecisionBarProps {
  clientId: number;
  clientName: string;
}

export function IntakeDecisionBar({ clientId, clientName }: IntakeDecisionBarProps) {
  const router = useRouter();
  const [action, setAction] = useState<'idle' | 'declining' | 'done'>('idle');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ action: string; status: string } | null>(null);

  async function handleDecline() {
    setAction('declining');
    setError(null);
    try {
      const res = await fetch(`/api/admin/salon/summary/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          decline_type: 'referral',
          decline_reason: declineReason || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to process');
      const data = await res.json();
      setResult(data);
      setAction('done');
      setShowDeclineModal(false);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setAction('idle');
    }
  }

  function openReferModal() {
    setDeclineReason('');
    setError(null);
    setShowDeclineModal(true);
  }

  if (action === 'done' && result) {
    return (
      <Card className="border-2 border-warm-300 bg-warm-50">
        <CardContent className="py-6 text-center">
          <ArrowRightLeft className="w-12 h-12 text-warm-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-warm-700">
            {clientName} marked as referral
          </p>
          <p className="text-sm text-warm-600 mt-1">
            Referral notification has been sent via email.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/intake')}
          >
            Back to Consultation Forms
          </Button>
        </CardContent>
      </Card>
    );
  }

  const config = {
    title: 'Refer Client',
    description: 'This will send a referral notification via email, letting them know you can help find another stylist.',
    placeholder: 'Reason for referral (optional)...',
    confirmLabel: 'Confirm Referral',
    loadingLabel: 'Referring...',
  };

  return (
    <>
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-warm-800">{config.title}</h3>
            <p className="text-sm text-warm-500">
              {config.description}
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full border border-warm-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-warm-300 text-warm-800 placeholder:text-warm-400"
              placeholder={config.placeholder}
              maxLength={2000}
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={action === 'declining'}
                className="min-h-[44px] flex-1"
              >
                {action === 'declining' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {config.loadingLabel}</>
                ) : (
                  config.confirmLabel
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeclineModal(false)}
                disabled={action === 'declining'}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-warm-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="px-4 py-3 flex items-center gap-3 max-w-4xl mx-auto">
          <span className="text-sm text-warm-600 truncate flex-1 hidden sm:block">
            {clientName}
          </span>
          {error && !showDeclineModal && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <Button
            variant="outline"
            onClick={openReferModal}
            disabled={action !== 'idle'}
            className="min-h-[44px] flex-1 sm:flex-none border-warm-200 text-warm-500 hover:bg-warm-50"
          >
            <ArrowRightLeft className="w-4 h-4" /> Refer Out
          </Button>
        </div>
      </div>
    </>
  );
}
