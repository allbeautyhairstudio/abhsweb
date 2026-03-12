'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SalonReviewActionsProps {
  clientId: number;
  clientName: string;
  overallRating: 'green' | 'yellow' | 'red';
}

export function SalonReviewActions({ clientId, clientName, overallRating }: SalonReviewActionsProps) {
  const router = useRouter();
  const [action, setAction] = useState<'idle' | 'accepting' | 'declining' | 'done'>('idle');
  const [result, setResult] = useState<{ action: string; status: string; linkedBookings?: number } | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setAction('accepting');
    setError(null);
    try {
      const res = await fetch(`/api/admin/salon/summary/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (!res.ok) throw new Error('Failed to accept');
      const data = await res.json();
      setResult(data);
      setAction('done');
    } catch {
      setError('Failed to accept client. Please try again.');
      setAction('idle');
    }
  }

  async function handleDecline() {
    setAction('declining');
    setError(null);
    try {
      const res = await fetch(`/api/admin/salon/summary/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          decline_reason: declineReason || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to decline');
      const data = await res.json();
      setResult(data);
      setAction('done');
    } catch {
      setError('Failed to decline client. Please try again.');
      setAction('idle');
    }
  }

  if (action === 'done' && result) {
    const isAccepted = result.action === 'accepted';
    return (
      <Card className={`border-2 ${isAccepted ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
        <CardContent className="py-6 text-center">
          {isAccepted ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-emerald-700">
                {clientName} accepted as active client
              </p>
              {result.linkedBookings && result.linkedBookings > 0 && (
                <p className="text-sm text-emerald-600 mt-1">
                  {result.linkedBookings} booking request{result.linkedBookings > 1 ? 's' : ''} linked
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-red-700">
                {clientName} declined
              </p>
              <p className="text-sm text-red-600 mt-1">
                Decline notification will be sent via email.
              </p>
            </>
          )}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/intake')}
          >
            Back to Intake Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Review Decision</h3>
          <RatingBadge rating={overallRating} />
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {showDecline ? (
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">
              Decline reason (optional — will be included in email):
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="e.g., We're currently not accepting new color correction clients..."
              maxLength={2000}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={action !== 'idle'}
                className="flex-1"
              >
                {action === 'declining' ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Declining...</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-2" /> Confirm Decline</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDecline(false)}
                disabled={action !== 'idle'}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              disabled={action !== 'idle'}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {action === 'accepting' ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Accepting...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Accept Client</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDecline(true)}
              disabled={action !== 'idle'}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" /> Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RatingBadge({ rating }: { rating: 'green' | 'yellow' | 'red' }) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    yellow: 'bg-amber-100 text-amber-700 border-amber-300',
    red: 'bg-red-100 text-red-700 border-red-300',
  };
  const labels = {
    green: 'Ready',
    yellow: 'Review Needed',
    red: 'Incomplete',
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[rating]}`}>
      {labels[rating]}
    </span>
  );
}
