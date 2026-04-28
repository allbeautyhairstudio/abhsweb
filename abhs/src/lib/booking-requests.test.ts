import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  bookingRequestSchema,
  declineRequestSchema,
} from './booking-validation';

// --- Validation schema tests ---

const validRequest = {
  segments: [
    {
      serviceVariationId: 'SVC_VAR_001',
      serviceVariationVersion: '12345',
      durationMinutes: 60,
      serviceName: 'Balayage',
    },
  ],
  startAt: '2026-03-15T10:00:00-08:00',
  teamMemberId: 'TEAM_001',
  customer: {
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'jordan@example.com',
    phone: '555-123-4567',
  },
};

describe('bookingRequestSchema', () => {
  it('accepts valid single-segment request', () => {
    const result = bookingRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('accepts valid multi-segment request', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      segments: [
        { serviceVariationId: 'SVC_001', serviceVariationVersion: '1', durationMinutes: 30, serviceName: 'Cut' },
        { serviceVariationId: 'SVC_002', serviceVariationVersion: '2', durationMinutes: 45, serviceName: 'Color' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts request with optional customer note', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, note: 'First time client' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty segments array', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      segments: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 segments', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      segments: Array.from({ length: 6 }, (_, i) => ({
        serviceVariationId: `SVC_${i}`,
        serviceVariationVersion: '1',
        durationMinutes: 30,
        serviceName: `Service ${i}`,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing startAt', () => {
    const { startAt: _, ...noStart } = validRequest;
    const result = bookingRequestSchema.safeParse(noStart);
    expect(result.success).toBe(false);
  });

  it('rejects empty startAt', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      startAt: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing teamMemberId', () => {
    const { teamMemberId: _, ...noTeam } = validRequest;
    const result = bookingRequestSchema.safeParse(noTeam);
    expect(result.success).toBe(false);
  });

  it('rejects missing customer firstName', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, firstName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing customer lastName', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, lastName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid customer email', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, email: 'not-an-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing customer phone', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, phone: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects customer note over 2000 chars', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      customer: { ...validRequest.customer, note: 'x'.repeat(2001) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects segment with missing serviceName', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      segments: [
        { serviceVariationId: 'SVC_001', serviceVariationVersion: '1', durationMinutes: 30 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects segment with zero durationMinutes', () => {
    const result = bookingRequestSchema.safeParse({
      ...validRequest,
      segments: [
        { serviceVariationId: 'SVC_001', serviceVariationVersion: '1', durationMinutes: 0, serviceName: 'Cut' },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('declineRequestSchema', () => {
  it('accepts empty object (reason is optional)', () => {
    const result = declineRequestSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid reason', () => {
    const result = declineRequestSchema.safeParse({
      reason: 'Fully booked that day',
    });
    expect(result.success).toBe(true);
  });

  it('rejects reason over 500 chars', () => {
    const result = declineRequestSchema.safeParse({
      reason: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// --- Database helper tests ---
// Uses an in-memory SQLite DB to avoid touching real data.

import { CREATE_TABLES_SQL } from './schema';

// We test the helper logic directly with a real SQLite DB (in-memory).
// The helpers use getDb() which requires the full app DB setup,
// so we test the core SQL logic independently here.

describe('booking_requests table', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(CREATE_TABLES_SQL);
  });

  afterEach(() => {
    db.close();
  });

  const sampleSegments = JSON.stringify([
    { serviceVariationId: 'SVC_001', serviceVariationVersion: '1', durationMinutes: 60, serviceName: 'Balayage' },
  ]);

  function insertRequest(overrides: Record<string, unknown> = {}): number {
    const defaults = {
      customer_first_name: 'Jordan',
      customer_last_name: 'Smith',
      customer_email: 'jordan@example.com',
      customer_phone: '555-123-4567',
      customer_note: null,
      requested_start_at: '2026-03-15T10:00:00-08:00',
      total_duration_min: 60,
      segments_json: sampleSegments,
      team_member_id: 'TEAM_001',
      ...overrides,
    };

    const stmt = db.prepare(`
      INSERT INTO booking_requests (
        customer_first_name, customer_last_name, customer_email, customer_phone,
        customer_note, requested_start_at, total_duration_min, segments_json, team_member_id
      ) VALUES (@customer_first_name, @customer_last_name, @customer_email, @customer_phone,
        @customer_note, @requested_start_at, @total_duration_min, @segments_json, @team_member_id)
    `);

    return Number(stmt.run(defaults).lastInsertRowid);
  }

  it('creates a request and returns an ID', () => {
    const id = insertRequest();
    expect(id).toBeGreaterThan(0);
  });

  it('retrieves a request by ID', () => {
    const id = insertRequest();
    const row = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(id) as Record<string, unknown>;
    expect(row).toBeTruthy();
    expect(row.customer_first_name).toBe('Jordan');
    expect(row.status).toBe('pending_approval');
  });

  it('returns undefined for nonexistent ID', () => {
    const row = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(9999);
    expect(row).toBeUndefined();
  });

  it('updates status to approved', () => {
    const id = insertRequest();
    const result = db.prepare(`
      UPDATE booking_requests
      SET status = 'approved', responded_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ? AND status = 'pending_approval'
    `).run(id);
    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT status FROM booking_requests WHERE id = ?').get(id) as { status: string };
    expect(row.status).toBe('approved');
  });

  it('updates status to declined with reason', () => {
    const id = insertRequest();
    db.prepare(`
      UPDATE booking_requests
      SET status = 'declined', decline_reason = ?, responded_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ? AND status = 'pending_approval'
    `).run('Fully booked', id);

    const row = db.prepare('SELECT status, decline_reason FROM booking_requests WHERE id = ?').get(id) as {
      status: string;
      decline_reason: string;
    };
    expect(row.status).toBe('declined');
    expect(row.decline_reason).toBe('Fully booked');
  });

  it('prevents double-processing (WHERE status = pending_approval)', () => {
    const id = insertRequest();
    // First update succeeds
    const r1 = db.prepare(`
      UPDATE booking_requests SET status = 'approved' WHERE id = ? AND status = 'pending_approval'
    `).run(id);
    expect(r1.changes).toBe(1);

    // Second update fails (status is no longer pending_approval)
    const r2 = db.prepare(`
      UPDATE booking_requests SET status = 'declined' WHERE id = ? AND status = 'pending_approval'
    `).run(id);
    expect(r2.changes).toBe(0);
  });

  it('queries pending requests by date range', () => {
    insertRequest({ requested_start_at: '2026-03-15T10:00:00Z' });
    insertRequest({ requested_start_at: '2026-03-16T14:00:00Z' });
    insertRequest({ requested_start_at: '2026-03-20T09:00:00Z' }); // outside range

    const rows = db.prepare(`
      SELECT * FROM booking_requests
      WHERE status = 'pending_approval'
        AND requested_start_at >= ?
        AND requested_start_at < ?
      ORDER BY requested_start_at ASC
    `).all('2026-03-15T00:00:00Z', '2026-03-17T00:00:00Z');

    expect(rows).toHaveLength(2);
  });

  it('detects overlapping slot conflict', () => {
    // Existing: 18:00 - 19:00 UTC (60 min)
    // Store end_at alongside for reliable overlap detection
    insertRequest({
      requested_start_at: '2026-03-15T18:00:00',
      total_duration_min: 60,
      team_member_id: 'TEAM_001',
    });

    // New request: 18:30 - 19:30 overlaps
    // Overlap check: existing.start < new.end AND existing.end > new.start
    // Compute existing end in the query using julianday arithmetic
    const newStart = '2026-03-15T18:30:00';
    const newEnd = '2026-03-15T19:30:00';
    const conflict = db.prepare(`
      SELECT id FROM booking_requests
      WHERE status = 'pending_approval'
        AND team_member_id = ?
        AND requested_start_at < ?
        AND julianday(requested_start_at) + (total_duration_min / 1440.0) > julianday(?)
    `).get('TEAM_001', newEnd, newStart);

    expect(conflict).toBeTruthy();
  });

  it('allows non-overlapping slot', () => {
    // Existing: 18:00 - 19:00
    insertRequest({
      requested_start_at: '2026-03-15T18:00:00',
      total_duration_min: 60,
      team_member_id: 'TEAM_001',
    });

    // New request: 20:00 - 21:00 — no overlap
    const newStart = '2026-03-15T20:00:00';
    const newEnd = '2026-03-15T21:00:00';
    const conflict = db.prepare(`
      SELECT id FROM booking_requests
      WHERE status = 'pending_approval'
        AND team_member_id = ?
        AND requested_start_at < ?
        AND julianday(requested_start_at) + (total_duration_min / 1440.0) > julianday(?)
    `).get('TEAM_001', newEnd, newStart);

    expect(conflict).toBeUndefined();
  });

  it('ignores declined/expired requests in conflict check', () => {
    const id = insertRequest({
      requested_start_at: '2026-03-15T18:00:00',
      total_duration_min: 60,
      team_member_id: 'TEAM_001',
    });
    db.prepare("UPDATE booking_requests SET status = 'declined' WHERE id = ?").run(id);

    // Same time slot — should NOT conflict since the first was declined
    const newStart = '2026-03-15T18:00:00';
    const newEnd = '2026-03-15T19:00:00';
    const conflict = db.prepare(`
      SELECT id FROM booking_requests
      WHERE status = 'pending_approval'
        AND team_member_id = ?
        AND requested_start_at < ?
        AND julianday(requested_start_at) + (total_duration_min / 1440.0) > julianday(?)
    `).get('TEAM_001', newEnd, newStart);

    expect(conflict).toBeUndefined();
  });

  it('auto-expires stale requests (older than 48 hours)', () => {
    // Insert with created_at manually set to 3 days ago
    db.prepare(`
      INSERT INTO booking_requests (
        created_at, customer_first_name, customer_last_name, customer_email,
        customer_phone, requested_start_at, total_duration_min, segments_json, team_member_id
      ) VALUES (datetime('now', '-72 hours'), 'Old', 'Request', 'old@test.com',
        '555-0000', '2026-03-10T10:00:00Z', 60, ?, 'TEAM_001')
    `).run(sampleSegments);

    // Insert a fresh one
    insertRequest();

    // Run expiration
    const result = db.prepare(`
      UPDATE booking_requests
      SET status = 'expired', updated_at = datetime('now')
      WHERE status = 'pending_approval'
        AND created_at < datetime('now', '-48 hours')
    `).run();

    expect(result.changes).toBe(1);

    // Fresh one should still be pending
    const pending = db.prepare(
      "SELECT COUNT(*) as count FROM booking_requests WHERE status = 'pending_approval'"
    ).get() as { count: number };
    expect(pending.count).toBe(1);
  });

  it('stores and retrieves segments_json correctly', () => {
    const segments = [
      { serviceVariationId: 'SVC_001', serviceVariationVersion: '1', durationMinutes: 30, serviceName: 'Cut' },
      { serviceVariationId: 'SVC_002', serviceVariationVersion: '2', durationMinutes: 45, serviceName: 'Color' },
    ];
    const id = insertRequest({ segments_json: JSON.stringify(segments) });

    const row = db.prepare('SELECT segments_json FROM booking_requests WHERE id = ?').get(id) as {
      segments_json: string;
    };
    const parsed = JSON.parse(row.segments_json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].serviceName).toBe('Cut');
    expect(parsed[1].durationMinutes).toBe(45);
  });

  it('stores square_booking_id on approval', () => {
    const id = insertRequest();
    db.prepare(`
      UPDATE booking_requests
      SET status = 'approved', square_booking_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run('BOOKING_ABC123', id);

    const row = db.prepare('SELECT square_booking_id FROM booking_requests WHERE id = ?').get(id) as {
      square_booking_id: string;
    };
    expect(row.square_booking_id).toBe('BOOKING_ABC123');
  });
});
