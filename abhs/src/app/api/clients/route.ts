import { NextRequest, NextResponse } from 'next/server';
import { getAllClients, searchClients, createClient, deleteClients } from '@/lib/queries/clients';
import { quickAddClientSchema, fullIntakeSchema, bulkDeleteSchema } from '@/lib/validation';
import { sanitizeClientData } from '@/lib/sanitize';
import { isAuthenticated } from '@/lib/admin-auth';

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const clients = query
      ? searchClients(query)
      : getAllClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const raw = await request.json();
    const parsed = bulkDeleteSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const deleted = deleteClients(parsed.data.ids);
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error('DELETE /api/clients error:', error);
    return NextResponse.json({ error: 'Failed to delete clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) return UNAUTHORIZED;
  try {
    const raw = await request.json();

    // Determine schema: if only quick-add fields, use quickAdd; otherwise full intake
    const isQuickAdd = !raw.q06_years_in_business && !raw.q09_schedule_fullness;
    const schema = isQuickAdd ? quickAddClientSchema : fullIntakeSchema;
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // Sanitize all string inputs before storage
    const sanitized = sanitizeClientData(parsed.data as Record<string, unknown>);
    const id = createClient(sanitized);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
