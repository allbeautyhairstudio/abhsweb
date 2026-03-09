import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, serializeBigInt, lookupServiceName } from '@/lib/square';

/**
 * GET /api/admin/bookings/[bookingId]
 * Retrieves a single booking's full details from Square.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const client = getSquareClient();

    const result = await client.bookings.get({ bookingId });
    const booking = result.booking;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Enrich with customer and service details
    let customerName = 'Unknown';
    let customerPhone = '';
    let customerEmail = '';

    if (booking.customerId) {
      try {
        const cResult = await client.customers.get({ customerId: booking.customerId });
        const c = cResult.customer;
        if (c) {
          customerName = [c.givenName, c.familyName].filter(Boolean).join(' ') || 'Unknown';
          customerPhone = c.phoneNumber ?? '';
          customerEmail = c.emailAddress ?? '';
        }
      } catch {
        // Non-critical
      }
    }

    const segment = booking.appointmentSegments?.[0];
    const serviceName = segment?.serviceVariationId
      ? await lookupServiceName(client, segment.serviceVariationId)
      : 'Service';

    return NextResponse.json(
      serializeBigInt({
        booking: {
          id: booking.id,
          startAt: booking.startAt,
          durationMinutes: segment?.durationMinutes ?? 60,
          serviceName,
          serviceVariationId: segment?.serviceVariationId ?? '',
          customerName,
          customerPhone,
          customerEmail,
          customerNote: booking.customerNote ?? '',
          status: booking.status,
          version: booking.version,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        },
      })
    );
  } catch (error) {
    console.error('Admin booking detail error:', error);
    return NextResponse.json(
      { error: 'Unable to load booking details.' },
      { status: 500 }
    );
  }
}
