'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BreakdownItem } from '@/lib/scoring';

interface ScoreCardProps {
  title: string;
  score: number;
  label: 'Strong' | 'Moderate' | 'Low';
  breakdown: Record<string, BreakdownItem>;
  icon: React.ReactNode;
}

function scoreColor(label: 'Strong' | 'Moderate' | 'Low'): string {
  switch (label) {
    case 'Strong': return 'text-emerald-600';
    case 'Moderate': return 'text-amber-600';
    case 'Low': return 'text-red-600';
  }
}

function scoreBg(label: 'Strong' | 'Moderate' | 'Low'): string {
  switch (label) {
    case 'Strong': return 'bg-emerald-50 border-emerald-200';
    case 'Moderate': return 'bg-amber-50 border-amber-200';
    case 'Low': return 'bg-red-50 border-red-200';
  }
}

function barColor(label: 'Strong' | 'Moderate' | 'Low'): string {
  switch (label) {
    case 'Strong': return 'bg-emerald-500';
    case 'Moderate': return 'bg-amber-500';
    case 'Low': return 'bg-red-500';
  }
}

export function ScoreCard({ title, score, label, breakdown, icon }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const breakdownEntries = Object.entries(breakdown);

  return (
    <Card className={`border ${scoreBg(label)}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>

        {/* Score + Label */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${scoreColor(label)}`}>{score}</span>
          <span className={`text-sm font-medium ${scoreColor(label)}`}>{label}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
          <div
            className={`h-2 rounded-full transition-all ${barColor(label)}`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>

        {/* Expand/collapse breakdown */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-700 transition-colors"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Hide' : 'Show'} ${title} details`}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {breakdownEntries.map(([key, item]) => (
              <div key={key} className="text-xs">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-muted-foreground">{item.reason}</span>
                  <span className="font-medium tabular-nums">
                    {item.points}/{item.maxPoints}
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full">
                  <div
                    className={`h-1 rounded-full ${item.points >= item.maxPoints * 0.7 ? 'bg-emerald-400' : item.points >= item.maxPoints * 0.4 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
