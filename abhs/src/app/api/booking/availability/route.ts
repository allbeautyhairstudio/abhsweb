import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getLocationId, serializeBigInt } from '@/lib/square';
import {
  searchAvailabilitySchema,
  searchMultiAvailabilitySchema,
} from '@/lib/booking-validation';
import { getPendingRequestsForRange } from '@/lib/booking-requests';
import type { AvailableSlot } from '@/lib/booking-types';

/**
 * Rate limiting — 20 requests per IP per hour.
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
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

/**
 * Business hours cache — refreshed every 30 minutes.
 * Maps day-of-week (e.g. "TUE") to { startLocalTime, endLocalTime }.
 */
interface HoursPeriod {
  dayOfWeek: string;
  startLocalTime: string;
  endLocalTime: string;
}

let cachedHours: HoursPeriod[] | null = null;
let hoursCachedAt = 0;
const HOURS_CACHE_MS = 30 * 60 * 1000; // 30 minutes

async function getBusinessHours(): Promise<HoursPeriod[]> {
  if (cachedHours && Date.now() - hoursCachedAt < HOURS_CACHE_MS) {
    return cachedHours;
  }

  const client = getSquareClient();
  const locationId = getLocationId();
  const loc = await client.locations.get({ locationId });
  const periods = (loc.location?.businessHours?.periods ?? []) as HoursPeriod[];

  cachedHours = periods;
  hoursCachedAt = Date.now();
  return periods;
}

/** Map JS getDay() to Square day names */
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Parse "HH:MM:SS" local time string into minutes since midnight.
 */
function localTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Get the IANA timezone offset for a specific date in America/Los_Angeles.
 * Returns "-08:00" or "-07:00" depending on DST.
 */
function getPacificOffset(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  // Format with timeZone to detect DST
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'shortOffset',
  }).formatToParts(d);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  // "GMT-8" or "GMT-7"
  if (tzPart?.value?.includes('-7')) return '-07:00';
  return '-08:00';
}

/**
 * POST /api/booking/availability
 * Calculates available time slots using business hours and active bookings.
 * Bypasses Square's searchAvailability (which incorrectly blocks cancelled bookings).
 *
 * Accepts two formats (backward compatible):
 * - Single:  { serviceVariationId, date, teamMemberId? }
 * - Multi:   { segments: [{ serviceVariationId }], date, teamMemberId? }
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
    let segments: Array<{ serviceVariationId: string }>;
    let date: string;
    let teamMemberId: string | undefined;

    if (body.segments) {
      const parsed = searchMultiAvailabilitySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      segments = parsed.data.segments;
      date = parsed.data.date;
      teamMemberId = parsed.data.teamMemberId;
    } else {
      const parsed = searchAvailabilitySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      segments = [{ serviceVariationId: parsed.data.serviceVariationId }];
      date = parsed.data.date;
      teamMemberId = parsed.data.teamMemberId;
    }

    const client = getSquareClient();
    const locationId = getLocationId();

    // No same-day bookings
    const todayPacific = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    if (date === todayPacific) {
      return NextResponse.json({ slots: [] });
    }

    // 1. Get business hours for the requested day
    const hours = await getBusinessHours();
    const requestedDate = new Date(`${date}T12:00:00Z`);
    const dayName = DAY_NAMES[requestedDate.getUTCDay()];
    const dayHours = hours.find((h) => h.dayOfWeek === dayName);

    if (!dayHours) {
      // Not a business day
      return NextResponse.json({ slots: [] });
    }

    const openMinutes = localTimeToMinutes(dayHours.startLocalTime);
    const closeMinutes = localTimeToMinutes(dayHours.endLocalTime);

    // 2. Look up total service duration from catalog
    let totalServiceDuration = 0;
    for (const seg of segments) {
      try {
        const catObj = await client.catalog.object.get({
          objectId: seg.serviceVariationId,
        });
        const varData = catObj.object as unknown as Record<string, unknown>;
        const itemVarData = varData.itemVariationData as Record<string, unknown> | undefined;
        const serviceDuration = itemVarData?.serviceDuration as bigint | number | undefined;
        if (serviceDuration) {
          // Square stores duration in milliseconds
          totalServiceDuration += Number(serviceDuration) / 60000;
        }
      } catch {
        // Fallback: use 45 min default
        totalServiceDuration += 45;
      }
    }

    if (totalServiceDuration === 0) totalServiceDuration = 45;

    // 3. Get team member ID (for the slot response)
    let resolvedTeamMemberId = teamMemberId ?? '';
    if (!resolvedTeamMemberId) {
      try {
        const teamResponse = await client.bookings.teamMemberProfiles.list({
          bookableOnly: true,
        });
        resolvedTeamMemberId = teamResponse.data[0]?.teamMemberId ?? '';
      } catch {
        // Non-critical
      }
    }

    // 4. Fetch active bookings for this day (only ACCEPTED and PENDING)
    const offset = getPacificOffset(date);
    const dayStartISO = `${date}T00:00:00${offset}`;
    const nextDayDate = new Date(`${date}T12:00:00${offset}`);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const dayEndISO = nextDayDate.toISOString();

    const bookingsResponse = await client.bookings.list({
      locationId,
      startAtMin: dayStartISO,
      startAtMax: dayEndISO,
    });

    // Build list of busy time blocks (in minutes since midnight, local time)
    const busyBlocks: Array<{ start: number; end: number }> = [];

    for (const booking of bookingsResponse.data) {
      const st = booking.status ?? '';
      // Only count active bookings — skip cancelled/declined/no-show
      if (st.startsWith('CANCELLED') || st === 'DECLINED' || st === 'NO_SHOW') {
        continue;
      }

      if (!booking.startAt) continue;

      // Convert booking start to local minutes
      const bookingStart = new Date(booking.startAt);
      // Get local time in Pacific
      const localStr = bookingStart.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      const [bh, bm] = localStr.split(':').map(Number);
      const startMin = bh * 60 + bm;

      // Total duration across all segments
      const duration = booking.appointmentSegments?.reduce(
        (sum, seg) => sum + (seg.durationMinutes ?? 0),
        0
      ) ?? 60;

      busyBlocks.push({ start: startMin, end: startMin + duration });
    }

    // 4b. Also block slots that have pending local booking requests
    try {
      const pendingRequests = getPendingRequestsForRange(dayStartISO, dayEndISO);
      for (const req of pendingRequests) {
        const reqStart = new Date(req.requestedStartAt);
        const localStr = reqStart.toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });
        const [rh, rm] = localStr.split(':').map(Number);
        const startMin = rh * 60 + rm;
        busyBlocks.push({ start: startMin, end: startMin + req.totalDurationMin });
      }
    } catch {
      // Non-critical — if local DB fails, still show Square-based availability
    }

    // 5. Generate available slots at 15-minute intervals
    const SLOT_INTERVAL = 15; // minutes between slot start times
    const slots: AvailableSlot[] = [];

    for (let min = openMinutes; min + totalServiceDuration <= closeMinutes; min += SLOT_INTERVAL) {
      const slotStart = min;
      const slotEnd = min + totalServiceDuration;

      // Check if this slot overlaps with any busy block
      const isBlocked = busyBlocks.some(
        (block) => slotStart < block.end && slotEnd > block.start
      );

      if (!isBlocked) {
        // Convert local minutes back to ISO timestamp
        const hours = Math.floor(slotStart / 60);
        const mins = slotStart % 60;
        const localTimeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
        const isoStartAt = `${date}T${localTimeStr}${offset}`;

        // Convert to UTC for consistent output
        const utcDate = new Date(isoStartAt);

        slots.push({
          startAt: utcDate.toISOString(),
          teamMemberId: resolvedTeamMemberId,
          serviceVariationId: segments[0].serviceVariationId,
          durationMinutes: totalServiceDuration,
        });
      }
    }

    return NextResponse.json(serializeBigInt({ slots }));
  } catch (error) {
    console.error('Availability search error:', error);
    return NextResponse.json(
      { error: 'Unable to check availability. Please try again.' },
      { status: 500 }
    );
  }
}
