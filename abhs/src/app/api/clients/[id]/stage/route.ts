import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient } from '@/lib/queries/clients';
import { stageTransitionSchema } from '@/lib/validation';

/** Maps pipeline stages to their corresponding date columns. */
const STAGE_DATE_MAP: Partial<Record<string, string>> = {
  intake_submitted: 'intake_date',
  active_client: 'intake_date',
};

/** PUT: Advance a client to a new pipeline stage. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = getClientById(numId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const raw = await request.json();
    const parsed = stageTransitionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { stage } = parsed.data;
    const updates: Record<string, unknown> = { status: stage };

    // Auto-stamp the date for this stage
    const dateField = STAGE_DATE_MAP[stage];
    if (dateField) {
      updates[dateField] = new Date().toISOString().slice(0, 10);
    }

    updateClient(numId, updates);

    const updated = getClientById(numId);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/clients/[id]/stage error:', error);
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
  }
}
