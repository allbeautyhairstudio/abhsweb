import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { declineRequestSchema } from '@/lib/booking-validation';
import {
  getBookingRequestById,
  updateBookingRequestStatus,
} from '@/lib/booking-requests';
import { notifyCustomerDecline } from '@/lib/notify-decline';

/**
 * POST /api/admin/booking-requests/[requestId]/decline
 * Declines a pending booking request and optionally notifies the customer.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { requestId: requestIdStr } = await params;
    const requestId = parseInt(requestIdStr, 10);

    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const bookingRequest = getBookingRequestById(requestId);
    if (!bookingRequest) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    }

    if (bookingRequest.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Request has already been ${bookingRequest.status}` },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = declineRequestSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    const updated = updateBookingRequestStatus(requestId, 'declined', {
      declineReason: reason ?? '',
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Request was already processed.' },
        { status: 409 }
      );
    }

    // Fire-and-forget decline email to customer
    const serviceNames = bookingRequest.segments.map((s) => s.serviceName).join(', ');
    const bookingDate = new Date(bookingRequest.requestedStartAt).toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'long', day: 'numeric' }
    );

    notifyCustomerDecline({
      toEmail: bookingRequest.customerEmail,
      firstName: bookingRequest.customerFirstName,
      serviceNames,
      bookingDate,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Decline booking request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
