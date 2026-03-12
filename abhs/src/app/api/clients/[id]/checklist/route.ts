import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/queries/clients';
import { getChecklist, toggleChecklistItem } from '@/lib/queries/notes';
import { checklistToggleSchema } from '@/lib/validation';
import { escapeHtml } from '@/lib/sanitize';
import { isAuthenticated } from '@/lib/admin-auth';

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** GET: Return checklist completion state for a client's stage. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
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

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || client.status;

    const checklist = getChecklist(numId, stage);
    return NextResponse.json(checklist);
  } catch (error) {
    console.error('GET /api/clients/[id]/checklist error:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

/** POST: Toggle a checklist item on/off. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
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
    const parsed = checklistToggleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const sanitizedItem = escapeHtml(parsed.data.item);
    toggleChecklistItem(numId, parsed.data.stage, sanitizedItem, parsed.data.completed);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/clients/[id]/checklist error:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}
