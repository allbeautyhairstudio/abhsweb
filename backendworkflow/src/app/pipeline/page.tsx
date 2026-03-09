import { getAllClients } from '@/lib/queries/clients';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function PipelinePage() {
  const clients = getAllClients();

  // Only pass the fields the board needs (not all 48 intake columns)
  const clientSummaries = clients.map(c => ({
    id: c.id,
    status: c.status,
    q02_client_name: c.q02_client_name,
    q01_business_name: c.q01_business_name,
    q05_service_type: c.q05_service_type,
    updated_at: c.updated_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Track clients through every stage of the reset process
        </p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading pipeline...</div>}>
        <PipelineBoard initialClients={clientSummaries} />
      </Suspense>
    </div>
  );
}
