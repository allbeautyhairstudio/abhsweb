import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/queries/clients';
import {
  getDeliverablesByClientId,
  getDeliverableById,
  initializeDeliverables,
  updateDeliverable,
} from '@/lib/queries/deliverables';
import { updateDeliverableWithReviewSchema } from '@/lib/validation';
import { escapeHtml } from '@/lib/sanitize';
import { PIPELINE_STAGES } from '@/lib/constants/stages';

/** Stages at or past analysis_prep (where deliverables become relevant). */
const DELIVERABLE_ELIGIBLE_STAGES = new Set<string>(
  PIPELINE_STAGES.slice(
    PIPELINE_STAGES.findIndex(s => s.id === 'analysis_prep')
  ).map(s => s.id)
);

/** GET: Return all deliverables for a client. Auto-initializes if eligible. */
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

    // Auto-initialize if client is past analysis_prep and has no deliverables
    if (DELIVERABLE_ELIGIBLE_STAGES.has(client.status)) {
      initializeDeliverables(numId);
    }

    const deliverables = getDeliverablesByClientId(numId);
    return NextResponse.json(deliverables);
  } catch (error) {
    console.error('GET /api/clients/[id]/deliverables error:', error);
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 });
  }
}

/** PUT: Update a specific deliverable's status/content/notes. */
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
    const parsed = updateDeliverableWithReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // RAI check: marking as "sent" requires confirmed_review
    if (parsed.data.status === 'sent' && !parsed.data.confirmed_review) {
      return NextResponse.json(
        { error: 'RAI review confirmation required before marking as sent' },
        { status: 400 }
      );
    }

    // Verify deliverable belongs to this client
    const deliverable = getDeliverableById(parsed.data.deliverable_id);
    if (!deliverable || deliverable.client_id !== numId) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const updateData: { status?: string; content?: string | null; notes?: string | null } = {
      status: parsed.data.status,
    };

    if (parsed.data.content !== undefined) {
      updateData.content = parsed.data.content ? escapeHtml(parsed.data.content) : null;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes ? escapeHtml(parsed.data.notes) : null;
    }

    updateDeliverable(parsed.data.deliverable_id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/clients/[id]/deliverables error:', error);
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 });
  }
}
