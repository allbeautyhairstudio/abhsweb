import { NextRequest, NextResponse } from 'next/server';
import { updateClientsStage } from '@/lib/queries/clients';
import { bulkStageSchema } from '@/lib/validation';
import { isAuthenticated } from '@/lib/admin-auth';

/** Maps pipeline stages to their corresponding date columns. */
const STAGE_DATE_MAP: Partial<Record<string, string>> = {
  intake_submitted: 'intake_date',
  active_client: 'intake_date',
  followup: 'followup_date',
};

/** PUT: Move multiple clients to a new pipeline stage. */
export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    console.error('PUT /api/clients/bulk-stage error:', error);
    return NextResponse.json({ error: 'Failed to update stages' }, { status: 500 });
  }
}
