import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, getLocationId, serializeBigInt, lookupServiceName } from '@/lib/square';
import type { BookingSummary } from '@/lib/booking-types';

/**
 * GET /api/admin/bookings
 * Lists bookings from Square for a date range.
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 * Defaults to current week if not specified.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const client = getSquareClient();
    const locationId = getLocationId();

    // Default to current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() + mondayOffset);
    defaultStart.setHours(0, 0, 0, 0);

    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 7);

    const startDate = searchParams.get('startDate') || defaultStart.toISOString().slice(0, 10);
    const endDate = searchParams.get('endDate') || defaultEnd.toISOString().slice(0, 10);

    const startAt = `${startDate}T00:00:00Z`;
    const endAt = `${endDate}T23:59:59Z`;

    // Fetch bookings from Square
    const response = await client.bookings.list({
      locationId,
      startAtMin: startAt,
      startAtMax: endAt,
    });

    const bookings: BookingSummary[] = [];

    if (response.data.length > 0) {
      // Build a map of customer IDs and service variation IDs to look up
      const customerIds = new Set<string>();
      const serviceVarIds = new Set<string>();
      const teamMemberIds = new Set<string>();

      for (const booking of response.data) {
        if (booking.customerId) customerIds.add(booking.customerId);
        for (const seg of booking.appointmentSegments ?? []) {
          if (seg.serviceVariationId) serviceVarIds.add(seg.serviceVariationId);
          if (seg.teamMemberId) teamMemberIds.add(seg.teamMemberId);
        }
      }

      // Batch lookup customers
      const customerMap = new Map<string, { name: string; phone: string; email: string }>();
      for (const cId of customerIds) {
        try {
          const cResult = await client.customers.get({ customerId: cId });
          const c = cResult.customer;
          if (c) {
            customerMap.set(cId, {
              name: [c.givenName, c.familyName].filter(Boolean).join(' ') || 'Unknown',
              phone: c.phoneNumber ?? '',
              email: c.emailAddress ?? '',
            });
          }
        } catch {
          // Skip unreachable customers
        }
      }

      // Batch lookup service names
      const serviceMap = new Map<string, string>();
      for (const sId of serviceVarIds) {
        serviceMap.set(sId, await lookupServiceName(client, sId));
      }

      // Batch lookup team member names
      const teamMap = new Map<string, string>();
      try {
        const teamResult = await client.bookings.teamMemberProfiles.list({ bookableOnly: false });
        for (const profile of teamResult.data) {
          if (profile.teamMemberId) {
            teamMap.set(profile.teamMemberId, profile.displayName ?? 'Staff');
          }
        }
      } catch {
        // Non-critical
      }

      // Build summaries — skip cancelled/no-show bookings
      // If ?debug=statuses, include all bookings (for troubleshooting)
      const showAll = new URL(request.url).searchParams.get('debug') === 'statuses';

      for (const booking of response.data) {
        const st = booking.status ?? '';
        if (!showAll && (st.startsWith('CANCELLED') || st === 'DECLINED' || st === 'NO_SHOW')) {
          continue;
        }

        const segment = booking.appointmentSegments?.[0];
        const customer = customerMap.get(booking.customerId ?? '') ?? {
          name: 'Walk-in',
          phone: '',
          email: '',
        };

        bookings.push({
          id: booking.id ?? '',
          startAt: booking.startAt ?? '',
          durationMinutes: segment?.durationMinutes ?? 60,
          serviceName: serviceMap.get(segment?.serviceVariationId ?? '') ?? 'Service',
          serviceVariationId: segment?.serviceVariationId ?? '',
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          customerNote: booking.customerNote ?? '',
          teamMemberName: teamMap.get(segment?.teamMemberId ?? '') ?? 'Staff',
          status: booking.status ?? 'UNKNOWN',
          version: Number(booking.version ?? 0),
          createdAt: booking.createdAt ?? '',
          updatedAt: booking.updatedAt ?? '',
        });
      }
    }

    // Sort by start time
    bookings.sort((a, b) => a.startAt.localeCompare(b.startAt));

    return NextResponse.json(serializeBigInt({ bookings }));
  } catch (error) {
    console.error('Admin bookings list error:', error);
    return NextResponse.json(
      { error: 'Unable to load bookings.' },
      { status: 500 }
    );
  }
}
