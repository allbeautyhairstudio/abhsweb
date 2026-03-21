import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getLocationId, serializeBigInt, lookupServiceName } from '@/lib/square';
import { createBookingSchema, createMultiBookingSchema } from '@/lib/booking-validation';
import { sanitizeString } from '@/lib/sanitize';
import { notifySms } from '@/lib/notify-sms';
import { notifyEmail } from '@/lib/notify-email';
import type { BookingConfirmation } from '@/lib/booking-types';

/**
 * Rate limiting — 5 requests per IP per hour (strict for booking creation).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  // Skip rate limiting for local development
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === '::ffff:127.0.0.1') {
    return false;
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

/**
 * Search for an existing Square customer by phone number, then email.
 * Returns the customer ID if found, null otherwise.
 */
async function findSquareCustomer(
  client: ReturnType<typeof getSquareClient>,
  phone: string,
  email: string
): Promise<string | null> {
  try {
    // Search by phone first (most reliable for Square Bookings)
    const phoneResult = await client.customers.search({
      query: {
        filter: {
          phoneNumber: { exact: phone },
        },
      },
    });
    if (phoneResult.customers?.[0]?.id) {
      return phoneResult.customers[0].id;
    }

    // Fall back to email search
    const emailResult = await client.customers.search({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });
    if (emailResult.customers?.[0]?.id) {
      return emailResult.customers[0].id;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/booking/create
 * Creates a booking: finds/creates customer, then creates the Square booking.
 *
 * Accepts two formats (backward compatible):
 * - Single: { serviceVariationId, serviceVariationVersion, startAt, teamMemberId, durationMinutes, customer }
 * - Multi:  { segments: [{ serviceVariationId, serviceVariationVersion, durationMinutes }], startAt, teamMemberId, customer }
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Detect format: multi-segment or single (backward compat)
    let segments: Array<{
      serviceVariationId: string;
      serviceVariationVersion: string;
      durationMinutes: number;
    }>;
    let startAt: string;
    let teamMemberId: string;
    let customerData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      note?: string;
    };

    if (body.segments) {
      // Multi-segment format
      const parsed = createMultiBookingSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid booking data', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      segments = parsed.data.segments;
      startAt = parsed.data.startAt;
      teamMemberId = parsed.data.teamMemberId;
      customerData = parsed.data.customer;
    } else {
      // Single-service format (backward compat)
      const parsed = createBookingSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid booking data', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      segments = [{
        serviceVariationId: parsed.data.serviceVariationId,
        serviceVariationVersion: parsed.data.serviceVariationVersion,
        durationMinutes: parsed.data.durationMinutes,
      }];
      startAt = parsed.data.startAt;
      teamMemberId = parsed.data.teamMemberId;
      customerData = parsed.data.customer;
    }

    const client = getSquareClient();
    const locationId = getLocationId();

    // Sanitize customer inputs
    const firstName = sanitizeString(customerData.firstName) ?? '';
    const lastName = sanitizeString(customerData.lastName) ?? '';
    const email = sanitizeString(customerData.email) ?? '';
    const phone = sanitizeString(customerData.phone) ?? '';
    const customerNote = customerData.note
      ? sanitizeString(customerData.note) ?? ''
      : '';

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Required customer fields are missing.' },
        { status: 400 }
      );
    }

    // Find or create Square customer
    let customerId = await findSquareCustomer(client, phone, email);

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
          { error: 'Unable to set up your customer profile. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Build appointment segments from cart
    const appointmentSegments = segments.map((seg) => ({
      teamMemberId,
      serviceVariationId: seg.serviceVariationId,
      serviceVariationVersion: BigInt(seg.serviceVariationVersion),
      durationMinutes: seg.durationMinutes,
    }));

    // Create the booking
    const bookingResult = await client.bookings.create({
      idempotencyKey: crypto.randomUUID(),
      booking: {
        locationId,
        customerId,
        startAt,
        customerNote: customerNote || undefined,
        appointmentSegments,
      },
    });

    const booking = bookingResult.booking;

    if (!booking?.id) {
      return NextResponse.json(
        { error: 'Booking could not be created. Please try again.' },
        { status: 500 }
      );
    }

    const bookingId = booking.id;
    // Status is controlled by Square Dashboard setting:
    // Settings → Calendar & Booking → "Business must accept or decline all appointment requests"
    // When enabled, bookings arrive as PENDING. When disabled, they auto-ACCEPT.
    const finalStatus = booking.status ?? 'PENDING';
    const finalStartAt = booking.startAt ?? startAt;

    // Look up all service names for confirmation
    const serviceNames = await Promise.all(
      segments.map((seg) =>
        lookupServiceName(client, seg.serviceVariationId, 'Appointment')
      )
    );

    const totalDuration = segments.reduce((sum, seg) => sum + seg.durationMinutes, 0);

    const confirmation: BookingConfirmation = {
      bookingId,
      startAt: finalStartAt,
      serviceName: serviceNames.join(', '),
      serviceNames,
      durationMinutes: segments[0].durationMinutes,
      totalDurationMinutes: totalDuration,
      status: finalStatus,
    };

    // Fire-and-forget SMS notification to Karli
    const bookingDate = new Date(confirmation.startAt).toLocaleDateString(
      'en-US',
      { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    );
    const smsServiceList = serviceNames.join(', ');
    const smsMessage = `New booking: ${firstName} ${lastName} for ${smsServiceList} on ${bookingDate}. Check admin dashboard.`;
    notifySms(smsMessage).catch(() => {});

    const siteUrl = process.env.SITE_URL || 'https://allbeautyhairstudio.com';
    const emailBody = [
      `New Booking Confirmed`,
      ``,
      `Client: ${firstName} ${lastName}`,
      `Services: ${smsServiceList}`,
      `Date: ${bookingDate}`,
      ``,
      `---`,
      `View in calendar:`,
      `${siteUrl}/admin/calendar`,
    ].join('\n');
    notifyEmail(`New Booking: ${firstName} ${lastName} - ${bookingDate}`, emailBody, {
      headline: 'Booking Confirmed',
      sections: [
        { label: 'Client', value: `${firstName} ${lastName}` },
        { label: 'Services', value: smsServiceList },
        { label: 'Date', value: bookingDate },
      ],
      actionUrl: `${siteUrl}/admin/calendar`,
      actionLabel: 'View Calendar',
    }).catch(() => {});

    return NextResponse.json(
      serializeBigInt({ success: true, booking: confirmation }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
