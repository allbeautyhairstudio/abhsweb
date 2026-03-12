import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, serializeBigInt } from '@/lib/square';
import { rescheduleBookingSchema } from '@/lib/booking-validation';

/**
 * PUT /api/admin/bookings/[bookingId]/reschedule
 * Reschedules a booking to a new time. Uses optimistic concurrency via version.
 * Body: { version: number, startAt: string (ISO 8601) }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const body = await request.json();
    const parsed = rescheduleBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // First get the current booking to preserve all other fields
    const current = await client.bookings.get({ bookingId });
    if (!current.booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const result = await client.bookings.update({
      bookingId,
      booking: {
        version: parsed.data.version,
        startAt: parsed.data.startAt,
        appointmentSegments: current.booking.appointmentSegments,
      },
      idempotencyKey: crypto.randomUUID(),
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        booking: {
          id: result.booking?.id,
          startAt: result.booking?.startAt,
          status: result.booking?.status,
          version: result.booking?.version,
        },
      })
    );
  } catch (error) {
    console.error('Reschedule booking error:', error);
    return NextResponse.json(
      { error: 'Unable to reschedule. The booking may have been modified.' },
      { status: 500 }
    );
  }
}
