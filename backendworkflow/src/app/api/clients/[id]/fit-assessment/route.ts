import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient } from '@/lib/queries/clients';
import { createNote } from '@/lib/queries/notes';
import { fitAssessmentActionSchema } from '@/lib/validation';
import { assessClient } from '@/lib/scoring';
import { escapeHtml } from '@/lib/sanitize';

/** GET: Compute and return the full fit assessment for a client. */
export async function GET(
  _request: NextRequest,
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

    const assessment = assessClient(client as unknown as Record<string, unknown>);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('GET /api/clients/[id]/fit-assessment error:', error);
    return NextResponse.json({ error: 'Failed to compute assessment' }, { status: 500 });
  }
}

/** PUT: Accept or decline a client based on fit assessment. */
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
    const parsed = fitAssessmentActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fit_rating, archetype, action, decline_reason } = parsed.data;

    if (action === 'accept') {
      // Update client fields + advance pipeline
      const updates: Record<string, unknown> = {
        fit_rating,
        archetype,
        status: 'fit_assessment',
      };

      updateClient(numId, updates);

      const updated = getClientById(numId);
      return NextResponse.json({ success: true, client: updated });
    }

    if (action === 'decline') {
      // Record the decline
      const updates: Record<string, unknown> = {
        fit_rating: 'red',
      };
      updateClient(numId, updates);

      // Create an interest_flag note documenting the decline
      const noteContent = decline_reason
        ? `Fit assessment: DECLINED. Reason: ${escapeHtml(decline_reason)}`
        : 'Fit assessment: DECLINED. No specific reason recorded.';
      createNote(numId, 'interest_flag', noteContent);

      const updated = getClientById(numId);
      return NextResponse.json({ success: true, client: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/clients/[id]/fit-assessment error:', error);
    return NextResponse.json({ error: 'Failed to process assessment action' }, { status: 500 });
  }
}
