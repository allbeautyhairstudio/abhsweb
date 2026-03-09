'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SalonScoreCard } from './salon-score-card';
import { ClipboardCheck, Brain, Heart, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import type { SalonSummary, ParsedSalonIntake } from '@/lib/salon-summary';
import type { SalonFlag } from '@/lib/constants/salon-scoring-rules';

interface SalonSummaryTabProps {
  clientId: number;
}

function flagBadge(flag: SalonFlag) {
  const styles: Record<string, string> = {
    HEADS_UP: 'bg-amber-100 text-amber-700 border-amber-300',
    GOOD_FIT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    NOTE: 'bg-blue-100 text-blue-700 border-blue-300',
  };
  return (
    <div key={flag.label} className="flex items-start gap-2 text-sm">
      <Badge className={`${styles[flag.type]} flex-shrink-0`}>
        {flag.type.replace('_', ' ')}
      </Badge>
      <span className="text-muted-foreground">{flag.label}</span>
    </div>
  );
}

export function SalonSummaryTab({ clientId }: SalonSummaryTabProps) {
  const [data, setData] = useState<{ summary: SalonSummary; intake: ParsedSalonIntake } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/admin/salon/summary/${clientId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('No intake data found for this client.');
          } else {
            setError('Failed to load summary.');
          }
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [clientId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Computing AI Summary...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{error || 'No summary available.'}</p>
        </CardContent>
      </Card>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-4">
      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SalonScoreCard
          title="Consultation Readiness"
          score={summary.readiness}
          icon={<ClipboardCheck size={18} />}
        />
        <SalonScoreCard
          title="Complexity"
          score={summary.complexity}
          icon={<Brain size={18} />}
          invertScale
        />
        <SalonScoreCard
          title="Engagement"
          score={summary.engagement}
          icon={<Heart size={18} />}
        />
      </div>

      {/* Flags & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flags.</p>
            ) : (
              <div className="space-y-2">
                {summary.flags.map((flag) => flagBadge(flag))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No highlights.</p>
            ) : (
              <ul className="space-y-1.5">
                {summary.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-brand-400 mt-0.5">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
