import { describe, it, expect } from 'vitest';
import { VALID_CLIENT_COLUMNS } from './clients';

describe('VALID_CLIENT_COLUMNS allowlist', () => {
  it('contains all 48 intake question columns', () => {
    for (let i = 1; i <= 48; i++) {
      const col = `q${String(i).padStart(2, '0')}_`;
      const match = [...VALID_CLIENT_COLUMNS].find(c => c.startsWith(col));
      expect(match, `Missing column for question ${i} (${col}*)`).toBeDefined();
    }
  });

  it('contains status/pipeline columns', () => {
    expect(VALID_CLIENT_COLUMNS.has('status')).toBe(true);
    expect(VALID_CLIENT_COLUMNS.has('fit_rating')).toBe(true);
    expect(VALID_CLIENT_COLUMNS.has('archetype')).toBe(true);
    expect(VALID_CLIENT_COLUMNS.has('time_tier')).toBe(true);
  });

  it('contains date columns', () => {
    const dateCols = [
      'inquiry_date', 'intake_date', 'payment_date', 'session_date',
      'deliverables_sent_date', 'followup_date', 'followup_complete_date',
    ];
    for (const col of dateCols) {
      expect(VALID_CLIENT_COLUMNS.has(col), `Missing: ${col}`).toBe(true);
    }
  });

  it('contains financial/testimonial columns', () => {
    const cols = [
      'price_paid', 'pricing_tier', 'testimonial_received',
      'testimonial_text', 'referral_source', 'referrals_given',
    ];
    for (const col of cols) {
      expect(VALID_CLIENT_COLUMNS.has(col), `Missing: ${col}`).toBe(true);
    }
  });

  it('does NOT contain auto-managed columns', () => {
    expect(VALID_CLIENT_COLUMNS.has('id')).toBe(false);
    expect(VALID_CLIENT_COLUMNS.has('created_at')).toBe(false);
    expect(VALID_CLIENT_COLUMNS.has('updated_at')).toBe(false);
  });

  it('rejects SQL injection attempts in column names', () => {
    expect(VALID_CLIENT_COLUMNS.has('id; DROP TABLE clients--')).toBe(false);
    expect(VALID_CLIENT_COLUMNS.has('q02_client_name; DROP TABLE')).toBe(false);
    expect(VALID_CLIENT_COLUMNS.has("Robert'); DROP TABLE clients;--")).toBe(false);
    expect(VALID_CLIENT_COLUMNS.has('')).toBe(false);
  });

  it('has exactly the expected number of columns (48 intake + 17 meta = 65)', () => {
    // 48 intake questions + 4 status (status, fit_rating, archetype, time_tier) +
    // 7 date columns + 2 financial (price_paid, pricing_tier) +
    // 4 testimonial/referral (testimonial_received, testimonial_text, referral_source, referrals_given) = 65
    expect(VALID_CLIENT_COLUMNS.size).toBe(65);
  });
});
