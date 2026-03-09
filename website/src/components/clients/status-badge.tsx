import { Badge } from '@/components/ui/badge';
import { PIPELINE_STAGES } from '@/lib/constants/stages';

const STAGE_COLORS: Record<string, string> = {
  inquiry: 'bg-brand-200 text-brand-800',
  intake_submitted: 'bg-brand-300 text-brand-900',
  fit_assessment: 'bg-amber-200 text-amber-900',
  payment: 'bg-amber-300 text-amber-900',
  analysis_prep: 'bg-orange-200 text-orange-900',
  session_scheduled: 'bg-orange-300 text-orange-900',
  session_complete: 'bg-sage-300 text-emerald-900',
  deliverables_sent: 'bg-sage-500 text-white',
  followup_scheduled: 'bg-emerald-200 text-emerald-900',
  followup_complete: 'bg-emerald-400 text-white',
};

export function StatusBadge({ status }: { status: string }) {
  const stage = PIPELINE_STAGES.find(s => s.id === status);
  const label = stage?.label ?? status;
  const colorClass = STAGE_COLORS[status] ?? 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={`border-0 ${colorClass}`}>
      {label}
    </Badge>
  );
}
