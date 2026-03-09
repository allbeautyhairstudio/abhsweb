import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient } from '@/lib/queries/clients';
import { initializeDeliverables } from '@/lib/queries/deliverables';
import { stageTransitionSchema } from '@/lib/validation';
import type { PipelineStage } from '@/lib/constants/stages';

/** Maps pipeline stages to their corresponding date columns. */
const STAGE_DATE_MAP: Partial<Record<PipelineStage, string>> = {
  inquiry: 'inquiry_date',
  intake_submitted: 'intake_date',
  payment: 'payment_date',
  session_scheduled: 'session_date',
  deliverables_sent: 'deliverables_sent_date',
  followup_scheduled: 'followup_date',
  followup_complete: 'followup_complete_date',
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

    // Initialize deliverables when entering analysis_prep
    if (stage === 'analysis_prep') {
      initializeDeliverables(numId);
    }

    const updated = getClientById(numId);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/clients/[id]/stage error:', error);
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
  }
}
