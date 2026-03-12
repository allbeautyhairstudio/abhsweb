import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, getLocationId, serializeBigInt, lookupServiceName } from '@/lib/square';
import { createBookingSchema } from '@/lib/booking-validation';
import { sanitizeString } from '@/lib/sanitize';

/**
 * POST /api/admin/bookings/create
 * Admin-only: Creates a Square booking directly (no approval queue).
 * Used when Karli books a client from the admin calendar.
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { serviceVariationId, serviceVariationVersion, startAt, teamMemberId, durationMinutes, customer } = parsed.data;

    const client = getSquareClient();
    const locationId = getLocationId();

    // Sanitize
    const firstName = sanitizeString(customer.firstName) ?? '';
    const lastName = sanitizeString(customer.lastName) ?? '';
    const email = sanitizeString(customer.email) ?? '';
    const phone = sanitizeString(customer.phone) ?? '';
    const note = customer.note ? sanitizeString(customer.note) ?? '' : '';

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Required customer fields are missing.' },
        { status: 400 }
      );
    }

    // Find or create Square customer
    let customerId: string | null = null;

    try {
      const phoneResult = await client.customers.search({
        query: { filter: { phoneNumber: { exact: phone } } },
      });
      customerId = phoneResult.customers?.[0]?.id ?? null;
    } catch { /* continue */ }

    if (!customerId) {
      try {
        const emailResult = await client.customers.search({
          query: { filter: { emailAddress: { exact: email } } },
        });
        customerId = emailResult.customers?.[0]?.id ?? null;
      } catch { /* continue */ }
    }

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

    // Create the booking
    const bookingResult = await client.bookings.create({
      idempotencyKey: crypto.randomUUID(),
      booking: {
        locationId,
        customerId,
        startAt,
        customerNote: note || undefined,
        appointmentSegments: [{
          teamMemberId,
          serviceVariationId,
          serviceVariationVersion: BigInt(serviceVariationVersion),
          durationMinutes,
        }],
      },
    });

    const booking = bookingResult.booking;
    if (!booking?.id) {
      return NextResponse.json(
        { error: 'Square booking could not be created.' },
        { status: 500 }
      );
    }

    const serviceName = await lookupServiceName(client, serviceVariationId, 'Appointment');

    return NextResponse.json(
      serializeBigInt({
        success: true,
        booking: {
          id: booking.id,
          startAt: booking.startAt ?? startAt,
          status: booking.status ?? 'ACCEPTED',
          serviceName,
          durationMinutes,
          customerName: `${firstName} ${lastName}`,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin create booking error:', error);
    return NextResponse.json(
      { error: 'Unable to create booking. Please try again.' },
      { status: 500 }
    );
  }
}
