import { getDb } from '../db';
import { DELIVERABLE_TYPES } from '../constants/stages';

export interface DeliverableRow {
  id: number;
  client_id: number;
  deliverable_type: string;
  status: string;
  content: string | null;
  generated_at: string | null;
  sent_at: string | null;
  notes: string | null;
}

/** Valid deliverable type IDs (security allowlist). */
const VALID_DELIVERABLE_TYPES = new Set<string>(DELIVERABLE_TYPES.map(d => d.id));

/** Get all deliverables for a client, ordered by type. */
export function getDeliverablesByClientId(clientId: number): DeliverableRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM deliverables WHERE client_id = ? ORDER BY id ASC'
  ).all(clientId) as DeliverableRow[];
}

/** Get a single deliverable by ID. */
export function getDeliverableById(id: number): DeliverableRow | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM deliverables WHERE id = ?'
  ).get(id) as DeliverableRow | undefined;
}

/** Initialize all 9 deliverable rows for a client. Skips if already initialized. */
export function initializeDeliverables(clientId: number): void {
  const db = getDb();
  const existing = getDeliverablesByClientId(clientId);
  if (existing.length > 0) return;

  const stmt = db.prepare(
    'INSERT INTO deliverables (client_id, deliverable_type) VALUES (?, ?)'
  );

  const insertAll = db.transaction(() => {
    for (const type of DELIVERABLE_TYPES) {
      stmt.run(clientId, type.id);
    }
  });

  insertAll();
}

/** Update a deliverable's status, content, and/or notes. */
export function updateDeliverable(
  id: number,
  data: { status?: string; content?: string | null; notes?: string | null }
): void {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (data.status !== undefined) {
    sets.push('status = ?');
    values.push(data.status);

    if (data.status === 'generated') {
      sets.push("generated_at = datetime('now')");
    }
    if (data.status === 'sent') {
      sets.push("sent_at = datetime('now')");
    }
  }
  if (data.content !== undefined) {
    sets.push('content = ?');
    values.push(data.content);
  }
  if (data.notes !== undefined) {
    sets.push('notes = ?');
    values.push(data.notes);
  }

  if (sets.length === 0) return;

  values.push(id);
  db.prepare(`UPDATE deliverables SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

/** Check if a deliverable type is valid. */
export function isValidDeliverableType(type: string): boolean {
  return VALID_DELIVERABLE_TYPES.has(type);
}
