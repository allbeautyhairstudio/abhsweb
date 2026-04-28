import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, getLocationId, serializeBigInt } from '@/lib/square';
import {
  getBookingRequestById,
  updateBookingRequestStatus,
} from '@/lib/booking-requests';

/**
 * POST /api/admin/booking-requests/[requestId]/approve
 * Approves a pending booking request:
 *   1. Verifies the slot is still available in Square
 *   2. Finds or creates the Square customer
 *   3. Creates the Square booking (auto-accepts with seller token — that's fine, Karli already approved)
 *   4. Updates the local request status to 'approved'
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

    const client = getSquareClient();
    const locationId = getLocationId();

    // Layer 2: Re-check availability using active bookings (NOT Square's searchAvailability,
    // which incorrectly blocks cancelled bookings)
    try {
      const startDate = bookingRequest.requestedStartAt.slice(0, 10);
      const requestedStart = new Date(bookingRequest.requestedStartAt);

      // Get Pacific offset for DST awareness
      const offsetDate = new Date(`${startDate}T12:00:00Z`);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'shortOffset',
      }).formatToParts(offsetDate);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      const offset = tzPart?.value?.includes('-7') ? '-07:00' : '-08:00';

      const dayStartISO = `${startDate}T00:00:00${offset}`;
      const nextDay = new Date(`${startDate}T12:00:00${offset}`);
      nextDay.setDate(nextDay.getDate() + 1);
      const dayEndISO = nextDay.toISOString();

      const bookingsResponse = await client.bookings.list({
        locationId,
        startAtMin: dayStartISO,
        startAtMax: dayEndISO,
      });

      // Check if any active booking overlaps with the requested slot
      const totalDuration = bookingRequest.totalDurationMin;
      const requestedStartMs = requestedStart.getTime();
      const requestedEndMs = requestedStartMs + totalDuration * 60000;

      const hasConflict = bookingsResponse.data.some((booking) => {
        const st = booking.status ?? '';
        if (st.startsWith('CANCELLED') || st === 'DECLINED' || st === 'NO_SHOW') return false;
        if (!booking.startAt) return false;

        const bookingStartMs = new Date(booking.startAt).getTime();
        const bookingDuration = booking.appointmentSegments?.reduce(
          (sum, seg) => sum + (seg.durationMinutes ?? 0) * 60000, 0
        ) ?? 3600000;
        const bookingEndMs = bookingStartMs + bookingDuration;

        return requestedStartMs < bookingEndMs && requestedEndMs > bookingStartMs;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: 'This time slot is no longer available in Square. The customer will need to pick a new time.' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error('Availability re-check error during approval:', error);
      return NextResponse.json(
        { error: 'Unable to verify availability. Please try again.' },
        { status: 500 }
      );
    }

    // Find or create Square customer
    const firstName = bookingRequest.customerFirstName;
    const lastName = bookingRequest.customerLastName;
    const email = bookingRequest.customerEmail;
    const phone = bookingRequest.customerPhone;

    let customerId: string | null = null;

    // Search by phone
    try {
      const phoneResult = await client.customers.search({
        query: {
          filter: { phoneNumber: { exact: phone } },
        },
      });
      customerId = phoneResult.customers?.[0]?.id ?? null;
    } catch { /* continue */ }

    // Search by email if phone didn't match
    if (!customerId) {
      try {
        const emailResult = await client.customers.search({
          query: {
            filter: { emailAddress: { exact: email } },
          },
        });
        customerId = emailResult.customers?.[0]?.id ?? null;
      } catch { /* continue */ }
    }

    // Create customer if not found
    if (!customerId) {
      const createResult = await client.customers.create({
        givenName: firstName,
        familyName: lastName,
        emailAddress: email,
        phoneNumber: phone,
        idempotencyKey: crypto.randomUUID(),
      });
      customerId = createResult.customer?.id ?? null;

      if (!customerId) {
        return NextResponse.json(
          { error: 'Unable to create customer in Square.' },
          { status: 500 }
        );
      }
    }

    // Build appointment segments
    const appointmentSegments = bookingRequest.segments.map((seg) => ({
      teamMemberId: bookingRequest.teamMemberId,
      serviceVariationId: seg.serviceVariationId,
      serviceVariationVersion: BigInt(seg.serviceVariationVersion),
      durationMinutes: seg.durationMinutes,
    }));

    // Create the Square booking
    const bookingResult = await client.bookings.create({
      idempotencyKey: crypto.randomUUID(),
      booking: {
        locationId,
        customerId,
        startAt: bookingRequest.requestedStartAt,
        customerNote: bookingRequest.customerNote || undefined,
        appointmentSegments,
      },
    });

    const booking = bookingResult.booking;
    if (!booking?.id) {
      return NextResponse.json(
        { error: 'Square booking could not be created. Please try again.' },
        { status: 500 }
      );
    }

    // Update local request to approved
    const updated = updateBookingRequestStatus(requestId, 'approved', {
      squareBookingId: booking.id,
      squareCustomerId: customerId,
    });

    if (!updated) {
      // Race condition: another admin already processed this
      return NextResponse.json(
        { error: 'Request was already processed by another admin.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      serializeBigInt({
        success: true,
        squareBookingId: booking.id,
        squareStatus: booking.status,
      })
    );
  } catch (error) {
    console.error('Approve booking request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
