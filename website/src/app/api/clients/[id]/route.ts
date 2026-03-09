import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/lib/queries/clients';
import { updateClientSchema } from '@/lib/validation';
import { sanitizeClientData } from '@/lib/sanitize';

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
    return NextResponse.json(client);
  } catch (error) {
    console.error(`GET /api/clients/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

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

    const raw = await request.json();
    const parsed = updateClientSchema.safeParse(raw);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Sanitize all string inputs before storage
    const sanitized = sanitizeClientData(parsed.data as Record<string, unknown>);
    updateClient(numId, sanitized);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`PUT /api/clients/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    deleteClient(numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/clients/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
