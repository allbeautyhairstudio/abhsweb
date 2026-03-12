import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getPendingIntakeCount } from '@/lib/queries/intake-queue';

/**
 * GET /api/admin/salon/intake-count
 * Returns the count of pending salon intake submissions.
 * Used by the sidebar badge for polling.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = getPendingIntakeCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/admin/salon/intake-count error:', error);
    return NextResponse.json({ error: 'Failed to get intake count' }, { status: 500 });
  }
}
