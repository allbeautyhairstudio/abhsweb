'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ClientContactActions } from '@/components/clients/client-contact-actions';
import type { IntakeQueueRow } from '@/lib/queries/intake-queue';

interface IntakeQueueTableProps {
  intakes: IntakeQueueRow[];
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z'); // SQLite datetime is UTC
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function statusBadge(status: string) {
  if (status === 'intake_submitted') {
    return <Badge className="bg-brand-200 text-brand-800 border-brand-300">New</Badge>;
  }
  if (status === 'ai_review') {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Under Review</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

/** Extract service interest from notes if stored in the name pattern. */
function extractServiceInterest(row: IntakeQueueRow): string {
  // The intake note has "Service Interest: X" but we don't have it on the row.
  // For the table, we'll show a generic label. The detail page shows full data.
  return '—';
}

const LAST_VIEWED_KEY = 'intake_last_viewed';

export function IntakeQueueTable({ intakes }: IntakeQueueTableProps) {
  const router = useRouter();
  const [lastViewed, setLastViewed] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_VIEWED_KEY);
    setLastViewed(stored);
    // Update last viewed to now
    localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
  }, []);

  function isNew(createdAt: string): boolean {
    if (!lastViewed) return true;
    return new Date(createdAt + 'Z') > new Date(lastViewed);
  }

  if (intakes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium mb-1">No pending intakes</p>
        <p className="text-sm">New client submissions will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {intakes.map((row) => (
          <div
            key={row.id}
            onClick={() => router.push(`/admin/intake/${row.id}`)}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              isNew(row.created_at)
                ? 'bg-brand-50/50 border-brand-200'
                : 'bg-muted border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {isNew(row.created_at) && (
                  <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" aria-label="New submission" />
                )}
                <span className="font-medium text-brand-700">{row.q02_client_name}</span>
              </div>
              {statusBadge(row.status)}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Submitted {relativeDate(row.created_at)}
            </p>
            <div className="mb-2.5" onClick={(e) => e.stopPropagation()}>
              <ClientContactActions
                email={row.q03_email}
                phone={row.phone}
                preferredContact={row.preferred_contact}
                variant="compact"
              />
            </div>
            <Button size="sm" variant="outline" className="w-full min-h-[44px]">
              <Eye className="w-4 h-4 mr-1.5" />
              Review
            </Button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-4 font-medium text-muted-foreground">Client</th>
            <th className="py-3 px-4 font-medium text-muted-foreground">Contact</th>
            <th className="py-3 px-4 font-medium text-muted-foreground">Submitted</th>
            <th className="py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="py-3 px-4 font-medium text-muted-foreground text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {intakes.map((row) => (
            <tr
              key={row.id}
              onClick={() => router.push(`/admin/intake/${row.id}`)}
              className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                isNew(row.created_at) ? 'bg-brand-50/50' : ''
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {isNew(row.created_at) && (
                    <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0" aria-label="New submission" />
                  )}
                  <span className="font-medium">{row.q02_client_name}</span>
                </div>
              </td>
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <ClientContactActions
                  email={row.q03_email}
                  phone={row.phone}
                  preferredContact={row.preferred_contact}
                  variant="compact"
                />
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {relativeDate(row.created_at)}
              </td>
              <td className="py-3 px-4">
                {statusBadge(row.status)}
              </td>
              <td className="py-3 px-4 text-right">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1.5" />
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
