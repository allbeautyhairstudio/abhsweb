'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SalonScore } from '@/lib/salon-summary';

interface SalonScoreCardProps {
  title: string;
  score: SalonScore;
  icon: React.ReactNode;
  /** High complexity uses a different color scale (high = amber, not green). */
  invertScale?: boolean;
}

function scoreColor(label: string, invert: boolean): string {
  if (invert) {
    // For complexity: High = amber (heads-up), Low = green (simple)
    switch (label) {
      case 'High': return 'text-amber-600';
      case 'Moderate': return 'text-amber-500';
      case 'Low': return 'text-emerald-600';
      default: return 'text-muted-foreground';
    }
  }
  switch (label) {
    case 'Strong': return 'text-emerald-600';
    case 'Moderate': return 'text-amber-600';
    case 'Low': return 'text-red-600';
    default: return 'text-muted-foreground';
  }
}

function scoreBg(label: string, invert: boolean): string {
  if (invert) {
    switch (label) {
      case 'High': return 'bg-amber-50 border-amber-200';
      case 'Moderate': return 'bg-amber-50/50 border-amber-100';
      case 'Low': return 'bg-emerald-50 border-emerald-200';
      default: return '';
    }
  }
  switch (label) {
    case 'Strong': return 'bg-emerald-50 border-emerald-200';
    case 'Moderate': return 'bg-amber-50 border-amber-200';
    case 'Low': return 'bg-red-50 border-red-200';
    default: return '';
  }
}

function barColor(label: string, invert: boolean): string {
  if (invert) {
    switch (label) {
      case 'High': return 'bg-amber-500';
      case 'Moderate': return 'bg-amber-400';
      case 'Low': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  }
  switch (label) {
    case 'Strong': return 'bg-emerald-500';
    case 'Moderate': return 'bg-amber-500';
    case 'Low': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

export function SalonScoreCard({ title, score, icon, invertScale = false }: SalonScoreCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className={`border ${scoreBg(score.label, invertScale)}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${scoreColor(score.label, invertScale)}`}>{score.score}</span>
          <span className={`text-sm font-medium ${scoreColor(score.label, invertScale)}`}>{score.label}</span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
          <div
            className={`h-2 rounded-full transition-all ${barColor(score.label, invertScale)}`}
            style={{ width: `${Math.min(score.score, 100)}%` }}
          />
        </div>

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
            {score.breakdowns.map((item) => (
              <div key={item.label} className="text-xs">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-muted-foreground">{item.label}</span>
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
