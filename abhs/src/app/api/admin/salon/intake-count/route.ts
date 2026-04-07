import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getPendingIntakeCount, getPendingIntakeIds } from '@/lib/queries/intake-queue';

/**
 * GET /api/admin/salon/intake-count
 * Returns count and IDs of pending salon intake submissions.
 * Sidebar uses IDs to subtract locally-viewed entries.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = getPendingIntakeCount();
    const ids = getPendingIntakeIds();
    return NextResponse.json({ count, ids });
  } catch (error) {
    console.error('GET /api/admin/salon/intake-count error:', error);
    return NextResponse.json({ error: 'Failed to get intake count' }, { status: 500 });
  }
}
