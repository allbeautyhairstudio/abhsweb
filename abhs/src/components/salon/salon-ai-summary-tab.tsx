'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryData {
  overallRating: string;
  flags: Array<{ type: string; label: string }>;
  highlights: string[];
}

export function SalonAISummaryTab({ clientId }: { clientId: number }) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/salon/summary/${clientId}`);
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary ?? null);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clientId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-warm-400">
          Loading summary...
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-warm-400">
          No intake data available for AI summary.
        </CardContent>
      </Card>
    );
  }

  const ratingConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    green: { label: 'Ready to Book', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    yellow: { label: 'Review Needed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    red: { label: 'Heads Up', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const rating = ratingConfig[summary.overallRating] || ratingConfig.yellow;

  return (
    <Card className="bg-blush-50/40 border-warm-100">
      <CardContent className="py-5 space-y-4">
        {/* Overall badge */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${rating.bg} ${rating.text} ${rating.border}`}>
            {rating.label}
          </span>
        </div>

        {/* Flags */}
        {summary.flags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {summary.flags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                  flag.type === 'HEADS_UP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  flag.type === 'GOOD_FIT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>{flag.type.replace('_', ' ')}</span>
                <span className="text-warm-500">{flag.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {summary.highlights.length > 0 && (
          <div>
            <p className="text-xs font-medium text-warm-500 uppercase tracking-wide mb-2">Key Highlights</p>
            <ul className="space-y-1.5">
              {summary.highlights.map((highlight, i) => (
                <li key={i} className="text-sm text-warm-600 flex items-start gap-2">
                  <span className="text-copper-400 mt-0.5">&#x2022;</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.flags.length === 0 && summary.highlights.length === 0 && (
          <p className="text-sm text-warm-400">No flags or highlights for this client.</p>
        )}
      </CardContent>
    </Card>
  );
}
