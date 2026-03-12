import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/queries/clients';
import { getNotesByClientId } from '@/lib/queries/notes';
import { isAuthenticated } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(_request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    const notes = getNotesByClientId(numId);

    const exportData = {
      exported_at: new Date().toISOString(),
      client,
      notes,
    };

    const clientName = (client.q02_client_name || 'client').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${clientName}-export-${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('GET /api/clients/[id]/export error:', error);
    return NextResponse.json({ error: 'Failed to export client data' }, { status: 500 });
  }
}
