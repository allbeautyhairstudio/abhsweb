import { Badge } from '@/components/ui/badge';

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  generated: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  sent: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  generated: 'Generated',
  reviewed: 'Reviewed',
  sent: 'Sent',
};

export function DeliverableStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`border-0 ${STATUS_STYLES[status] ?? STATUS_STYLES.not_started}`}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
