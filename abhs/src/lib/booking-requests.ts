/**
 * Booking request queue — local approval layer before Square booking creation.
 * Customer submits a request → stored here → Karli approves/declines from admin.
 * On approval, the Square booking is created via the existing create flow.
 */

import { getDb } from './db';
import { sanitizeString } from './sanitize';
import type { BookingRequest, BookingRequestSegment } from './booking-types';

/** Status values for booking requests. */
export type BookingRequestStatus = 'pending_approval' | 'approved' | 'declined' | 'expired';

/** Input for creating a new booking request. */
export interface CreateBookingRequestInput {
  clientId?: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string;
  requestedStartAt: string;
  totalDurationMin: number;
  segments: BookingRequestSegment[];
  teamMemberId: string;
}

/** Raw row shape from SQLite. */
interface BookingRequestRow {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  client_id: number | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_note: string | null;
  requested_start_at: string;
  total_duration_min: number;
  segments_json: string;
  team_member_id: string;
  square_booking_id: string | null;
  square_customer_id: string | null;
  responded_at: string | null;
  decline_reason: string | null;
}

/** Convert a DB row to the BookingRequest interface. */
function rowToBookingRequest(row: BookingRequestRow): BookingRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as BookingRequest['status'],
    clientId: row.client_id,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerNote: row.customer_note,
    requestedStartAt: row.requested_start_at,
    totalDurationMin: row.total_duration_min,
    segments: JSON.parse(row.segments_json) as BookingRequestSegment[],
    teamMemberId: row.team_member_id,
    squareBookingId: row.square_booking_id,
    squareCustomerId: row.square_customer_id,
    respondedAt: row.responded_at,
    declineReason: row.decline_reason,
  };
}

/**
 * Insert a new booking request. Returns the new row ID.
 * Sanitizes all customer text fields before storage.
 */
export function createBookingRequest(input: CreateBookingRequestInput): number {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO booking_requests (
      client_id, customer_first_name, customer_last_name, customer_email, customer_phone,
      customer_note, requested_start_at, total_duration_min, segments_json, team_member_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.clientId ?? null,
    sanitizeString(input.customerFirstName) ?? '',
    sanitizeString(input.customerLastName) ?? '',
    sanitizeString(input.customerEmail) ?? '',
    sanitizeString(input.customerPhone) ?? '',
    input.customerNote ? sanitizeString(input.customerNote) : null,
    input.requestedStartAt,
    input.totalDurationMin,
    JSON.stringify(input.segments),
    input.teamMemberId,
  );

  return Number(result.lastInsertRowid);
}

/** Fetch a single booking request by ID, or null if not found. */
export function getBookingRequestById(id: number): BookingRequest | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(id) as BookingRequestRow | undefined;
  return row ? rowToBookingRequest(row) : null;
}

/**
 * Get pending booking requests within a date range.
 * Used by admin calendar to show pending requests alongside Square bookings.
 */
export function getPendingRequestsForRange(
  startDate: string,
  endDate: string
): BookingRequest[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT * FROM booking_requests
    WHERE status = 'pending_approval'
      AND requested_start_at >= ?
      AND requested_start_at < ?
    ORDER BY requested_start_at ASC
  `).all(startDate, endDate) as BookingRequestRow[];

  return rows.map(rowToBookingRequest);
}

/**
 * Get booking requests filtered by status.
 * Pass status = undefined to get all.
 */
export function getBookingRequestsByStatus(
  status?: BookingRequestStatus
): BookingRequest[] {
  const db = getDb();

  if (status) {
    const rows = db.prepare(
      'SELECT * FROM booking_requests WHERE status = ? ORDER BY created_at DESC'
    ).all(status) as BookingRequestRow[];
    return rows.map(rowToBookingRequest);
  }

  const rows = db.prepare(
    'SELECT * FROM booking_requests ORDER BY created_at DESC'
  ).all() as BookingRequestRow[];
  return rows.map(rowToBookingRequest);
}

/**
 * Update a booking request's status. Returns true if the row was updated.
 * Uses WHERE status = 'pending_approval' to prevent double-processing.
 */
export function updateBookingRequestStatus(
  id: number,
  newStatus: BookingRequestStatus,
  extra?: {
    squareBookingId?: string;
    squareCustomerId?: string;
    declineReason?: string;
  }
): boolean {
  const db = getDb();

  const sets = [
    "status = ?",
    "updated_at = datetime('now')",
    "responded_at = datetime('now')",
  ];
  const params: (string | number)[] = [newStatus];

  if (extra?.squareBookingId) {
    sets.push("square_booking_id = ?");
    params.push(extra.squareBookingId);
  }
  if (extra?.squareCustomerId) {
    sets.push("square_customer_id = ?");
    params.push(extra.squareCustomerId);
  }
  if (extra?.declineReason !== undefined) {
    sets.push("decline_reason = ?");
    params.push(extra.declineReason);
  }

  params.push(id); // WHERE id

  const result = db.prepare(`
    UPDATE booking_requests
    SET ${sets.join(', ')}
    WHERE id = ? AND status = 'pending_approval'
  `).run(...params);

  return result.changes > 0;
}

/**
 * Check for overlapping pending requests (soft-reserve conflict detection).
 * Returns true if there IS a conflict (slot is taken).
 */
export function checkLocalSlotConflict(
  teamMemberId: string,
  startAt: string,
  durationMin: number,
  excludeId?: number
): boolean {
  const db = getDb();

  // Calculate end time for the new request
  const endAt = new Date(new Date(startAt).getTime() + durationMin * 60 * 1000).toISOString();

  let query = `
    SELECT id FROM booking_requests
    WHERE status = 'pending_approval'
      AND team_member_id = ?
      AND requested_start_at < ?
      AND julianday(requested_start_at) + (total_duration_min / 1440.0) > julianday(?)
  `;
  const params: (string | number)[] = [teamMemberId, endAt, startAt];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const row = db.prepare(query).get(...params);
  return row !== undefined;
}

/**
 * Auto-expire booking requests older than 48 hours.
 * Returns count of expired requests.
 * Called lazily when admin fetches the list.
 */
export function expireStaleRequests(): number {
  const db = getDb();

  const result = db.prepare(`
    UPDATE booking_requests
    SET status = 'expired', updated_at = datetime('now')
    WHERE status = 'pending_approval'
      AND created_at < datetime('now', '-48 hours')
  `).run();

  return result.changes;
}

/**
 * Get booking requests linked to a specific client.
 * Used to show a client's booking history on their detail page.
 */
export function getBookingRequestsByClientId(clientId: number): BookingRequest[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM booking_requests WHERE client_id = ? ORDER BY created_at DESC'
  ).all(clientId) as BookingRequestRow[];
  return rows.map(rowToBookingRequest);
}

/**
 * Link unlinked booking requests to a client by email match.
 * Called when accepting an intake — connects orphaned requests to the client.
 * Returns count of linked requests.
 */
export function linkBookingRequestsByEmail(clientId: number, email: string): number {
  const db = getDb();
  const result = db.prepare(`
    UPDATE booking_requests
    SET client_id = ?, updated_at = datetime('now')
    WHERE customer_email = ? AND client_id IS NULL
  `).run(clientId, email);
  return result.changes;
}
