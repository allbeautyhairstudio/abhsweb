import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getSquareClient, getLocationId, serializeBigInt, lookupServiceName } from '@/lib/square';
import { getDb } from '@/lib/db';
import type { BookingSummary } from '@/lib/booking-types';

/**
 * GET /api/admin/bookings/client/[clientId]
 * Finds bookings for a CRM client by looking up their email/phone in Square.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { clientId } = await params;
    const db = getDb();
    const client = getSquareClient();
    const locationId = getLocationId();

    // Look up client's contact info from CRM
    const crmClient = db
      .prepare('SELECT q02_client_name, q03_email FROM clients WHERE id = ?')
      .get(Number(clientId)) as { q02_client_name: string; q03_email: string } | undefined;

    if (!crmClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Search Square customers by email
    let squareCustomerId: string | null = null;

    if (crmClient.q03_email) {
      try {
        const searchResult = await client.customers.search({
          query: {
            filter: {
              emailAddress: { exact: crmClient.q03_email },
            },
          },
        });
        squareCustomerId = searchResult.customers?.[0]?.id ?? null;
      } catch {
        // Non-critical
      }
    }

    if (!squareCustomerId) {
      return NextResponse.json({ bookings: [] });
    }

    // Fetch bookings for this customer
    // Search across a wide range (last 6 months to next 3 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const response = await client.bookings.list({
      locationId,
      startAtMin: startDate.toISOString(),
      startAtMax: endDate.toISOString(),
    });

    const bookings: BookingSummary[] = [];

    // Filter to only this customer's bookings
    if (response.data.length > 0) {
      // Lookup service names
      const serviceMap = new Map<string, string>();

      for (const booking of response.data) {
        if (booking.customerId !== squareCustomerId) continue;

        const segment = booking.appointmentSegments?.[0];
        let serviceName = serviceMap.get(segment?.serviceVariationId ?? '');

        if (!serviceName && segment?.serviceVariationId) {
          serviceName = await lookupServiceName(client, segment.serviceVariationId);
          serviceMap.set(segment.serviceVariationId, serviceName);
        }

        bookings.push({
          id: booking.id ?? '',
          startAt: booking.startAt ?? '',
          durationMinutes: segment?.durationMinutes ?? 60,
          serviceName: serviceName ?? 'Service',
          serviceVariationId: segment?.serviceVariationId ?? '',
          customerName: crmClient.q02_client_name ?? 'Client',
          customerPhone: '',
          customerEmail: crmClient.q03_email ?? '',
          customerNote: booking.customerNote ?? '',
          teamMemberName: '',
          status: booking.status ?? 'UNKNOWN',
          version: Number(booking.version ?? 0),
          createdAt: booking.createdAt ?? '',
          updatedAt: booking.updatedAt ?? '',
        });
      }
    }

    bookings.sort((a, b) => b.startAt.localeCompare(a.startAt)); // Newest first

    return NextResponse.json(serializeBigInt({ bookings }));
  } catch (error) {
    console.error('Client bookings error:', error);
    return NextResponse.json(
      { error: 'Unable to load client bookings.' },
      { status: 500 }
    );
  }
}
