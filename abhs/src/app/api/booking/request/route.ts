import { NextRequest, NextResponse } from 'next/server';
import { bookingRequestSchema } from '@/lib/booking-validation';
import { sanitizeString } from '@/lib/sanitize';
import {
  createBookingRequest,
  checkLocalSlotConflict,
} from '@/lib/booking-requests';
import { getSquareClient, getLocationId } from '@/lib/square';
import { searchClients } from '@/lib/queries/clients';
import { notifySms } from '@/lib/notify-sms';
import { notifyEmail } from '@/lib/notify-email';
import type { BookingRequestConfirmation } from '@/lib/booking-types';

/**
 * Rate limiting — 5 requests per IP per hour.
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
 * POST /api/booking/request
 * Submits a booking request to the local approval queue.
 * Karli must approve from admin before the Square booking is created.
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
    const parsed = bookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { segments, startAt, teamMemberId, customer } = parsed.data;

    // Sanitize customer fields
    const firstName = sanitizeString(customer.firstName) ?? '';
    const lastName = sanitizeString(customer.lastName) ?? '';
    const email = sanitizeString(customer.email) ?? '';
    const phone = sanitizeString(customer.phone) ?? '';
    const note = customer.note ? sanitizeString(customer.note) ?? '' : undefined;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Required customer fields are missing.' },
        { status: 400 }
      );
    }

    const totalDuration = segments.reduce((sum, seg) => sum + seg.durationMinutes, 0);

    // No same-day bookings — must be at least tomorrow
    const requestedDate = new Date(startAt);
    const nowPacific = new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    const requestedDatePacific = requestedDate.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    if (requestedDatePacific === nowPacific) {
      return NextResponse.json(
        { error: 'Same-day bookings are not available. Please choose a future date.' },
        { status: 400 }
      );
    }

    // Layer 1: Check for local slot conflicts (other pending requests)
    const localConflict = checkLocalSlotConflict(teamMemberId, startAt, totalDuration);
    if (localConflict) {
      return NextResponse.json(
        { error: 'This time slot already has a pending request. Please choose a different time.' },
        { status: 409 }
      );
    }

    // Layer 1b: Soft-check Square availability (non-blocking)
    // The real availability gate is Layer 2 at approval time.
    // We log a warning here but never reject — Karli decides.
    try {
      const client = getSquareClient();
      const locationId = getLocationId();

      const startDate = startAt.slice(0, 10);
      const dayStart = `${startDate}T00:00:00-08:00`;
      const dayEnd = `${startDate}T23:59:59-08:00`;

      const availability = await client.bookings.searchAvailability({
        query: {
          filter: {
            locationId,
            startAtRange: { startAt: dayStart, endAt: dayEnd },
            segmentFilters: segments.map((seg) => ({
              serviceVariationId: seg.serviceVariationId,
              teamMemberIdFilter: { any: [teamMemberId] },
            })),
          },
        },
      });

      const matchingSlot = availability.availabilities?.some(
        (a) => a.startAt === startAt
      );

      if (!matchingSlot) {
        console.warn('Square availability soft-check: slot may no longer be available for', startAt);
      }
    } catch (error) {
      console.error('Square availability check error:', error);
    }

    // Try to link to existing client by email
    let clientId: number | undefined;
    try {
      const matchingClients = searchClients(email);
      if (matchingClients.length > 0) {
        clientId = matchingClients[0].id;
      }
    } catch {
      // Non-critical — proceed without linking
    }

    // Save to local queue
    const requestId = createBookingRequest({
      clientId,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: email,
      customerPhone: phone,
      customerNote: note,
      requestedStartAt: startAt,
      totalDurationMin: totalDuration,
      segments,
      teamMemberId,
    });

    const serviceNames = segments.map((seg) => seg.serviceName);

    const confirmation: BookingRequestConfirmation = {
      requestId,
      status: 'pending_approval',
      requestedStartAt: startAt,
      serviceNames,
      totalDurationMinutes: totalDuration,
    };

    // Fire-and-forget SMS notification to Karli
    const bookingDate = new Date(startAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const smsServiceList = serviceNames.join(', ');
    const smsMessage = `New booking request: ${firstName} ${lastName} for ${smsServiceList} on ${bookingDate}. Open admin to approve/decline.`;
    notifySms(smsMessage).catch(() => {});

    const siteUrl = process.env.SITE_URL || 'https://allbeautyhairstudio.com';
    const emailBody = [
      `New Booking Request`,
      ``,
      `Client: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Services: ${smsServiceList}`,
      `Date: ${bookingDate}`,
      ``,
      `---`,
      `Approve or decline:`,
      `${siteUrl}/admin/calendar`,
    ].join('\n');
    notifyEmail(`Booking Request: ${firstName} ${lastName} - ${bookingDate}`, emailBody, {
      headline: 'New Booking Request',
      sections: [
        { label: 'Client', value: `${firstName} ${lastName}` },
        { label: 'Email', value: email },
        { label: 'Services', value: smsServiceList },
        { label: 'Date', value: bookingDate },
      ],
      actionUrl: `${siteUrl}/admin/calendar`,
      actionLabel: 'Approve or Decline',
    }).catch(() => {});

    return NextResponse.json(
      { success: true, booking: confirmation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
