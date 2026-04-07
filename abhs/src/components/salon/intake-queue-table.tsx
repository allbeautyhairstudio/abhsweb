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

function statusBadge(status: string, viewed: boolean) {
  if (status === 'intake_submitted' && !viewed) {
    return <Badge className="bg-forest-200 text-forest-600 border-forest-300">New</Badge>;
  }
  if (status === 'intake_submitted' && viewed) {
    return <Badge className="bg-warm-200 text-warm-600 border-warm-300">Reviewed</Badge>;
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

const VIEWED_IDS_KEY = 'intake_viewed_ids';

function getViewedIds(): Set<number> {
  try {
    const stored = localStorage.getItem(VIEWED_IDS_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as number[]);
  } catch {
    return new Set();
  }
}

function markViewed(id: number) {
  const viewed = getViewedIds();
  viewed.add(id);
  localStorage.setItem(VIEWED_IDS_KEY, JSON.stringify([...viewed]));
}

export function IntakeQueueTable({ intakes }: IntakeQueueTableProps) {
  const router = useRouter();
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setViewedIds(getViewedIds());
  }, []);

  function handleClick(id: number) {
    markViewed(id);
    setViewedIds((prev) => new Set([...prev, id]));
    router.push(`/admin/intake/${id}`);
  }

  function isNew(id: number): boolean {
    return !viewedIds.has(id);
  }

  if (intakes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium mb-1">No pending consultations</p>
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
            onClick={() => handleClick(row.id)}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              isNew(row.id)
                ? 'bg-forest-100 border-forest-300 text-forest-800'
                : 'bg-warm-100 border-warm-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {isNew(row.id) && (
                  <span className="w-2 h-2 bg-forest-500 rounded-full flex-shrink-0" aria-label="New submission" />
                )}
                <span className={`font-medium ${isNew(row.id) ? 'text-forest-600' : 'text-brand-700'}`}>{row.q02_client_name}</span>
              </div>
              {statusBadge(row.status, !isNew(row.id))}
            </div>
            <p className={`text-xs mb-2 ${isNew(row.id) ? 'text-forest-500' : 'text-muted-foreground'}`}>
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
              onClick={() => handleClick(row.id)}
              className={`border-b hover:bg-warm-200/50 transition-colors cursor-pointer ${
                isNew(row.id) ? 'bg-forest-100 text-forest-800' : 'bg-warm-100/50'
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {isNew(row.id) && (
                    <span className="w-2 h-2 bg-forest-500 rounded-full flex-shrink-0" aria-label="New submission" />
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
                {statusBadge(row.status, !isNew(row.id))}
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
