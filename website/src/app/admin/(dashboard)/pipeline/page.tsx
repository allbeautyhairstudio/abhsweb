import { getAllClients } from '@/lib/queries/clients';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';
import { getStagesForBusinessType, type BusinessType } from '@/lib/constants/stages';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>;
}) {
  const { biz } = await searchParams;
  const businessType = (biz === 'reset' ? 'reset' : 'salon') as BusinessType;
  const stages = getStagesForBusinessType(businessType);
  const clients = getAllClients(businessType);

  // Only pass the fields the board needs (not all 48 intake columns)
  const clientSummaries = clients.map(c => ({
    id: c.id,
    status: c.status,
    q02_client_name: c.q02_client_name,
    q01_business_name: c.q01_business_name,
    q05_service_type: c.q05_service_type,
    updated_at: c.updated_at,
  }));

  const isSalon = businessType === 'salon';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          {isSalon
            ? 'Track salon clients from inquiry to active relationship'
            : 'Track clients through every stage of the reset process'}
        </p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading pipeline...</div>}>
        <PipelineBoard initialClients={clientSummaries} stages={stages} />
      </Suspense>
    </div>
  );
}
