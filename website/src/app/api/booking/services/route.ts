import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getLocationId, serializeBigInt } from '@/lib/square';
import type { BookableService, TeamMember } from '@/lib/booking-types';

/**
 * Rate limiting — 30 requests per IP per hour (generous for browsing).
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
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

/**
 * In-memory cache for services and team members (15-minute TTL).
 * Avoids excessive Square API calls for data that rarely changes.
 */
let servicesCache: { services: BookableService[]; teamMembers: TeamMember[]; expiresAt: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * GET /api/booking/services
 * Returns bookable services from Square's Catalog + team member profiles.
 */
export async function GET(request: NextRequest) {
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

    // Return cached data if fresh
    if (servicesCache && Date.now() < servicesCache.expiresAt) {
      return NextResponse.json(
        { services: servicesCache.services, teamMembers: servicesCache.teamMembers },
        {
          headers: {
            'Cache-Control': 'public, max-age=900, stale-while-revalidate=300',
          },
        }
      );
    }

    const client = getSquareClient();
    const locationId = getLocationId();

    // Fetch bookable services from Square Catalog
    const catalogResponse = await client.catalog.searchItems({
      productTypes: ['APPOINTMENTS_SERVICE'],
    });

    const services: BookableService[] = [];

    if (catalogResponse.items) {
      for (const item of catalogResponse.items) {
        // SDK v44 uses discriminated unions for CatalogObject — use type assertions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemData = (item as any).itemData;
        if (!itemData?.variations) continue;

        for (const variation of itemData.variations) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const varData = (variation as any).itemVariationData;
          if (!varData || varData.availableForBooking === false) continue;

          // Only include variations available at our location
          if (varData.locationOverrides) {
            const locationOverride = varData.locationOverrides.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (lo: any) => lo.locationId === locationId
            );
            if (locationOverride?.soldOut) continue;
          }

          services.push({
            id: item.id ?? '',
            variationId: variation.id ?? '',
            variationVersion: variation.version?.toString() ?? '0',
            name:
              itemData.variations.length > 1
                ? `${itemData.name} — ${varData.name}`
                : itemData.name ?? 'Service',
            durationMinutes: varData.serviceDuration
              ? Number(varData.serviceDuration) / 60000
              : 60,
            priceCents:
              varData.priceMoney?.amount != null
                ? Number(varData.priceMoney.amount)
                : null,
            currency: varData.priceMoney?.currency ?? 'USD',
          });
        }
      }
    }

    // Fetch team member booking profiles
    const teamResponse =
      await client.bookings.teamMemberProfiles.list({
        bookableOnly: true,
      });

    const teamMembers: TeamMember[] = [];

    if (teamResponse.data.length > 0) {
      for (const profile of teamResponse.data) {
        if (!profile.teamMemberId) continue;
        teamMembers.push({
          id: profile.teamMemberId,
          displayName: profile.displayName ?? 'Staff',
        });
      }
    }

    // Cache the results
    servicesCache = {
      services,
      teamMembers,
      expiresAt: Date.now() + CACHE_TTL,
    };

    return NextResponse.json(
      serializeBigInt({ services, teamMembers }),
      {
        headers: {
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Booking services fetch error:', error);
    return NextResponse.json(
      { error: 'Unable to load services. Please try again.' },
      { status: 500 }
    );
  }
}
