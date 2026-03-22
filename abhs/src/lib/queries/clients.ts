import { getDb } from '../db';

/** Allowlist of valid column names for the clients table.
 *  Any key not in this set is rejected before SQL construction. */
const VALID_CLIENT_COLUMNS = new Set([
  'status', 'fit_rating', 'archetype', 'time_tier',
  'inquiry_date', 'intake_date', 'payment_date', 'session_date',
  'deliverables_sent_date', 'followup_date', 'followup_complete_date',
  'price_paid', 'pricing_tier',
  'testimonial_received', 'testimonial_text', 'referral_source', 'referrals_given',
  'q01_business_name', 'q02_client_name', 'q03_email', 'q04_city_state',
  'q05_service_type', 'q06_years_in_business', 'q07_services_most_often', 'q08_most_profitable',
  'q09_schedule_fullness', 'q10_clients_per_week', 'q11_current_stage', 'q12_primary_goal',
  'q13_marketing_confidence',
  'q14_ideal_client', 'q15_clients_to_avoid', 'q16_problems_solved',
  'q17_client_sources', 'q18_new_clients_month', 'q19_what_works', 'q20_what_didnt_work',
  'q21_marketing_approach', 'q22_marketing_feelings', 'q23_hardest_now',
  'q24_social_active', 'q25_platforms_used', 'q26_post_frequency', 'q27_best_content',
  'q28_stopped_reason', 'q29_tolerable_activity',
  'q30_sell_more_of', 'q31_sell_less_of', 'q32_average_price', 'q33_highest_price',
  'q34_no_shows_impact',
  'q35_tech_comfort', 'q36_ai_usage', 'q37_help_wanted',
  'q38_time_for_marketing', 'q39_biggest_constraint', 'q40_success_90_days',
  'q41_website', 'q42_instagram_link', 'q43_other_social', 'q44_booking_link',
  'q45_proof_assets', 'q46_google_reviews',
  'q47_anything_else', 'q48_consent',
  // Contact & Personal
  'phone', 'birthdate', 'preferred_contact', 'services_received',
  // Consent tracking
  'consent_terms_accepted', 'consent_date',
]);

/** Exported for testing */
export { VALID_CLIENT_COLUMNS };

/** Filter object keys to only valid column names */
function filterValidColumns(data: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (VALID_CLIENT_COLUMNS.has(key)) {
      filtered[key] = data[key];
    }
  }
  return filtered;
}

export interface ClientRow {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  fit_rating: string | null;
  archetype: string | null;
  time_tier: number | null;
  inquiry_date: string | null;
  intake_date: string | null;
  payment_date: string | null;
  session_date: string | null;
  deliverables_sent_date: string | null;
  followup_date: string | null;
  followup_complete_date: string | null;
  price_paid: number | null;
  pricing_tier: string | null;
  testimonial_received: number;
  testimonial_text: string | null;
  referral_source: string | null;
  referrals_given: number;
  q01_business_name: string | null;
  q02_client_name: string;
  q03_email: string | null;
  q04_city_state: string | null;
  q05_service_type: string | null;
  q06_years_in_business: string | null;
  q07_services_most_often: string | null;
  q08_most_profitable: string | null;
  q09_schedule_fullness: string | null;
  q10_clients_per_week: string | null;
  q11_current_stage: string | null;
  q12_primary_goal: string | null;
  q13_marketing_confidence: number | null;
  q14_ideal_client: string | null;
  q15_clients_to_avoid: string | null;
  q16_problems_solved: string | null;
  q17_client_sources: string | null;
  q18_new_clients_month: string | null;
  q19_what_works: string | null;
  q20_what_didnt_work: string | null;
  q21_marketing_approach: string | null;
  q22_marketing_feelings: string | null;
  q23_hardest_now: string | null;
  q24_social_active: string | null;
  q25_platforms_used: string | null;
  q26_post_frequency: string | null;
  q27_best_content: string | null;
  q28_stopped_reason: string | null;
  q29_tolerable_activity: string | null;
  q30_sell_more_of: string | null;
  q31_sell_less_of: string | null;
  q32_average_price: string | null;
  q33_highest_price: string | null;
  q34_no_shows_impact: string | null;
  q35_tech_comfort: string | null;
  q36_ai_usage: string | null;
  q37_help_wanted: string | null;
  q38_time_for_marketing: string | null;
  q39_biggest_constraint: string | null;
  q40_success_90_days: string | null;
  q41_website: string | null;
  q42_instagram_link: string | null;
  q43_other_social: string | null;
  q44_booking_link: string | null;
  q45_proof_assets: string | null;
  q46_google_reviews: string | null;
  q47_anything_else: string | null;
  q48_consent: number | null;
  // Contact & Personal
  phone: string | null;
  birthdate: string | null;
  preferred_contact: string | null;
  services_received: string | null;
  // Consent tracking
  consent_terms_accepted: number;
  consent_date: string | null;
}

export function getAllClients(): ClientRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM clients ORDER BY updated_at DESC
  `).all() as ClientRow[];
}

export function getClientById(id: number): ClientRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as ClientRow | undefined;
}

export function searchClients(query: string): ClientRow[] {
  const db = getDb();
  const pattern = `%${query}%`;
  return db.prepare(`
    SELECT * FROM clients
    WHERE q02_client_name LIKE ?
       OR q01_business_name LIKE ?
       OR q03_email LIKE ?
       OR q05_service_type LIKE ?
       OR phone LIKE ?
    ORDER BY updated_at DESC
  `).all(pattern, pattern, pattern, pattern, pattern) as ClientRow[];
}

export function getClientsByStatus(status: string): ClientRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM clients WHERE status = ? ORDER BY updated_at DESC').all(status) as ClientRow[];
}

export function createClient(data: Record<string, unknown>): number {
  const db = getDb();
  const safe = filterValidColumns(data);
  const fields = Object.keys(safe);
  if (fields.length === 0) throw new Error('No valid fields provided');
  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map(f => safe[f]);

  const result = db.prepare(`
    INSERT INTO clients (${fields.join(', ')}) VALUES (${placeholders})
  `).run(...values);

  return result.lastInsertRowid as number;
}

export function updateClient(id: number, data: Record<string, unknown>): void {
  const db = getDb();
  const safe = filterValidColumns(data);
  const fields = Object.keys(safe);
  if (fields.length === 0) throw new Error('No valid fields provided');
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = [...fields.map(f => safe[f]), id];

  db.prepare(`
    UPDATE clients SET ${setClause}, updated_at = datetime('now') WHERE id = ?
  `).run(...values);
}

export function deleteClient(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM chat_messages WHERE client_id = ?').run(id);
  db.prepare('DELETE FROM client_notes WHERE client_id = ?').run(id);
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
}

export function getClientCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
  return row.count;
}

export function getClientCountByStatus(): Record<string, number> {
  const db = getDb();
  const rows = db.prepare(`SELECT status, COUNT(*) as count FROM clients GROUP BY status`).all() as Array<{ status: string; count: number }>;

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}

export function getUpcomingSessions(days: number = 7): ClientRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM clients
    WHERE session_date IS NOT NULL
      AND session_date >= date('now')
      AND session_date <= date('now', '+' || ? || ' days')
      AND status IN ('session_scheduled', 'analysis_prep', 'consultation_scheduled')
    ORDER BY session_date ASC
  `).all(days) as ClientRow[];
}

export function getOverdueFollowups(): ClientRow[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM clients
    WHERE followup_date IS NOT NULL
      AND followup_date < date('now')
      AND status IN ('followup_scheduled', 'deliverables_sent', 'followup')
    ORDER BY followup_date ASC
  `).all() as ClientRow[];
}

export function getMonthlyRevenue(): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM revenue_entries
    WHERE date >= date('now', 'start of month')
  `).get() as { total: number };
  return row.total;
}

export function getTestimonialCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as count FROM clients WHERE testimonial_received = 1').get() as { count: number };
  return row.count;
}

/** Bulk delete clients by IDs. Uses parameterized placeholders. */
export function deleteClients(ids: number[]): number {
  if (ids.length === 0) return 0;
  const db = getDb();
  const placeholders = ids.map(() => '?').join(', ');
  db.prepare(`DELETE FROM chat_messages WHERE client_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM client_notes WHERE client_id IN (${placeholders})`).run(...ids);
  const result = db.prepare(`DELETE FROM clients WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}

/** Bulk update pipeline stage for multiple clients. Auto-stamps date column. */
export function updateClientsStage(
  ids: number[],
  stage: string,
  dateColumn?: string
): number {
  if (ids.length === 0) return 0;
  const db = getDb();
  const placeholders = ids.map(() => '?').join(', ');
  const today = new Date().toISOString().slice(0, 10);

  if (dateColumn && VALID_CLIENT_COLUMNS.has(dateColumn)) {
    db.prepare(
      `UPDATE clients SET status = ?, ${dateColumn} = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`
    ).run(stage, today, ...ids);
  } else {
    db.prepare(
      `UPDATE clients SET status = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`
    ).run(stage, ...ids);
  }

  return ids.length;
}
