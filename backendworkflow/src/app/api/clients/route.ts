import { NextRequest, NextResponse } from 'next/server';
import { getAllClients, searchClients, createClient } from '@/lib/queries/clients';
import { quickAddClientSchema, fullIntakeSchema } from '@/lib/validation';
import { sanitizeClientData } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const clients = query ? searchClients(query) : getAllClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
