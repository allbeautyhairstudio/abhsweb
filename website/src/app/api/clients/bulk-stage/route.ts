import { NextRequest, NextResponse } from 'next/server';
import { updateClientsStage } from '@/lib/queries/clients';
import { initializeDeliverables } from '@/lib/queries/deliverables';
import { bulkStageSchema } from '@/lib/validation';

/** Maps pipeline stages to their corresponding date columns. */
const STAGE_DATE_MAP: Partial<Record<string, string>> = {
  // Reset stages
  inquiry: 'inquiry_date',
  intake_submitted: 'intake_date',
  payment: 'payment_date',
  session_scheduled: 'session_date',
  deliverables_sent: 'deliverables_sent_date',
  followup_scheduled: 'followup_date',
  followup_complete: 'followup_complete_date',
  // Salon stages
  consultation_scheduled: 'session_date', // legacy
  active_client: 'intake_date', // stamp when accepted
};

/** PUT: Move multiple clients to a new pipeline stage. */
export async function PUT(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bulkStageSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ids, stage } = parsed.data;
    const dateColumn = STAGE_DATE_MAP[stage];

    updateClientsStage(ids, stage, dateColumn);

    // Initialize deliverables for each client entering analysis_prep
    if (stage === 'analysis_prep') {
      for (const id of ids) {
        initializeDeliverables(id);
      }
    }

    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    console.error('PUT /api/clients/bulk-stage error:', error);
    return NextResponse.json({ error: 'Failed to update stages' }, { status: 500 });
  }
}
