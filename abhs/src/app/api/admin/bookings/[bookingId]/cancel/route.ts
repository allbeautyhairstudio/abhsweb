import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, serializeBigInt } from '@/lib/square';
import { cancelBookingSchema } from '@/lib/booking-validation';

/**
 * POST /api/admin/bookings/[bookingId]/cancel
 * Cancels a booking in Square. Requires the booking version for optimistic concurrency.
 * Body: { version: number, reason?: string }
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
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const client = getSquareClient();

    const result = await client.bookings.cancel({
      bookingId,
      bookingVersion: parsed.data.version,
      idempotencyKey: crypto.randomUUID(),
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        booking: {
          id: result.booking?.id,
          status: result.booking?.status,
        },
      })
    );
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Unable to cancel booking. It may have already been modified.' },
      { status: 500 }
    );
  }
}
