import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import {
  getPendingRequestsForRange,
  getBookingRequestsByStatus,
  expireStaleRequests,
} from '@/lib/booking-requests';
import type { BookingRequestStatus } from '@/lib/booking-requests';

/**
 * GET /api/admin/booking-requests
 * Lists booking requests from the local approval queue.
 * Query params: status (optional), startDate, endDate (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Auto-expire stale requests on every admin fetch
    expireStaleRequests();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BookingRequestStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let requests;

    if (startDate && endDate && (!status || status === 'pending_approval')) {
      // Date-range query for calendar view
      const startAt = `${startDate}T00:00:00`;
      const endAt = `${endDate}T23:59:59`;
      requests = getPendingRequestsForRange(startAt, endAt);
    } else {
      // Status-filtered or full list
      requests = getBookingRequestsByStatus(status ?? undefined);
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Admin booking-requests list error:', error);
    return NextResponse.json(
      { error: 'Unable to load booking requests.' },
      { status: 500 }
    );
  }
}
