/**
 * Query helpers for the salon intake queue.
 * Provides counts and lists for pending intake submissions.
 */

import { getDb } from '../db';

/** Client row shape (same as in clients.ts). */
export interface IntakeQueueRow {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  q02_client_name: string;
  q03_email: string | null;
  phone: string | null;
  preferred_contact: string | null;
  referral_source: string | null;
  business_type: string;
}

/**
 * Count salon clients pending intake review.
 * Used for the sidebar notification badge.
 */
export function getPendingIntakeCount(): number {
  const db = getDb();
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM clients WHERE business_type = 'salon' AND status IN ('intake_submitted', 'ai_review')"
  ).get() as { count: number };
  return row.count;
}

/**
 * Get all salon intake submissions (pending review).
 * Ordered newest first for the intake queue page.
 */
export function getIntakeSubmissions(): IntakeQueueRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, created_at, updated_at, status, q02_client_name, q03_email, phone, preferred_contact, referral_source, business_type
    FROM clients
    WHERE business_type = 'salon' AND status IN ('intake_submitted', 'ai_review')
    ORDER BY created_at DESC
  `).all() as IntakeQueueRow[];
}

/**
 * Get the intake note for a client (note_type = 'interest_flag').
 * Returns the note content string, or null if not found.
 */
export function getIntakeNote(clientId: number): string | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT content FROM client_notes WHERE client_id = ? AND note_type = 'interest_flag' ORDER BY created_at DESC LIMIT 1"
  ).get(clientId) as { content: string } | undefined;
  return row?.content ?? null;
}

/**
 * Get active salon clients (past the human gate).
 * Excludes intake_submitted, ai_review, and declined.
 */
export function getActiveSalonClients(): IntakeQueueRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, created_at, updated_at, status, q02_client_name, q03_email, phone, preferred_contact, referral_source, business_type
    FROM clients
    WHERE business_type = 'salon' AND status IN ('active_client', 'followup')
    ORDER BY updated_at DESC
  `).all() as IntakeQueueRow[];
}
