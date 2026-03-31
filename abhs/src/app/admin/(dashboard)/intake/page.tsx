import { Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getIntakeSubmissions, getPendingIntakeCount } from '@/lib/queries/intake-queue';
import { IntakeQueueTable } from '@/components/salon/intake-queue-table';

export const dynamic = 'force-dynamic';

export default function IntakeQueuePage() {
  const intakes = getIntakeSubmissions();
  const count = getPendingIntakeCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="w-6 h-6 text-brand-600" />
          <div>
            <h1 className="text-2xl font-bold">Consultation Form</h1>
            <p className="text-sm text-muted-foreground">
              {count === 0
                ? 'No pending reviews'
                : `${count} submission${count !== 1 ? 's' : ''} pending review`}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <IntakeQueueTable intakes={intakes} />
        </CardContent>
      </Card>
    </div>
  );
}
