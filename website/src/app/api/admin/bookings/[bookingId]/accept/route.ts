import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, serializeBigInt } from '@/lib/square';
import { acceptBookingSchema } from '@/lib/booking-validation';

/**
 * POST /api/admin/bookings/[bookingId]/accept
 * Approves a PENDING booking — sets status to ACCEPTED.
 * Body: { version: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const body = await request.json();
    const parsed = acceptBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    // Get current booking to preserve appointment segments
    const current = await client.bookings.get({ bookingId });
    if (!current.booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const result = await client.bookings.update({
      bookingId,
      booking: {
        version: parsed.data.version,
        status: 'ACCEPTED',
        appointmentSegments: current.booking.appointmentSegments,
      },
      idempotencyKey: crypto.randomUUID(),
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        booking: {
          id: result.booking?.id,
          status: result.booking?.status,
          version: result.booking?.version,
        },
      })
    );
  } catch (error) {
    console.error('Accept booking error:', error);
    return NextResponse.json(
      { error: 'Unable to accept booking. It may have already been modified.' },
      { status: 500 }
    );
  }
}
