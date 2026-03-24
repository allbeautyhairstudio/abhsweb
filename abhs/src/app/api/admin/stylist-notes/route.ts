import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getStylistNote, upsertStylistNote } from '@/lib/queries/notes';
import { z } from 'zod';

const PutSchema = z.object({
  clientId: z.number().int().positive(),
  content: z.string().max(5000),
});

/**
 * GET /api/admin/stylist-notes?clientId=N
 * Returns the stylist assessment note for a client.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = Number(request.nextUrl.searchParams.get('clientId'));
  if (!clientId || isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const content = getStylistNote(clientId);
  return NextResponse.json({ content });
}

/**
 * PUT /api/admin/stylist-notes
 * Create or update the stylist assessment note for a client.
 */
export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = PutSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  upsertStylistNote(body.clientId, body.content);
  return NextResponse.json({ success: true });
}
