import { describe, it, expect } from 'vitest';
import {
  buildFunnelFromCounts,
  conversionRate,
  formatRevenue,
  formatMonthLabel,
} from './metrics';
import type { FunnelStage } from './metrics';

// ── Test Fixtures ────────────────────────────────────────────────────────────

const STAGES = [
  { id: 'inquiry', label: 'Inquiry' },
  { id: 'intake_submitted', label: 'Intake Submitted' },
  { id: 'fit_assessment', label: 'Fit Assessment' },
  { id: 'payment', label: 'Payment' },
  { id: 'analysis_prep', label: 'Analysis & Prep' },
  { id: 'session_scheduled', label: 'Session Scheduled' },
  { id: 'session_complete', label: 'Session Complete' },
  { id: 'deliverables_sent', label: 'Deliverables Sent' },
  { id: 'followup_scheduled', label: 'Follow-Up Scheduled' },
  { id: 'followup_complete', label: 'Follow-Up Complete' },
];

// ── buildFunnelFromCounts ────────────────────────────────────────────────────

describe('buildFunnelFromCounts', () => {
  it('returns all stages with zero counts when no clients exist', () => {
    const result = buildFunnelFromCounts(STAGES, new Map(), 0);
    expect(result).toHaveLength(10);
    for (const stage of result) {
      expect(stage.count).toBe(0);
      expect(stage.percentage).toBe(0);
    }
  });

  it('computes cumulative counts correctly (clients at later stages count toward earlier)', () => {
    // 3 clients at inquiry, 2 at payment, 1 at followup_complete = 6 total
    const counts = new Map([
      ['inquiry', 3],
      ['payment', 2],
      ['followup_complete', 1],
    ]);
    const result = buildFunnelFromCounts(STAGES, counts, 6);

    // inquiry: 3 + 2 + 1 = 6 (all clients have at least reached inquiry)
    expect(result[0].count).toBe(6);
    expect(result[0].percentage).toBe(100);

    // intake_submitted: 2 + 1 = 3 (payment + followup_complete clients passed through it)
    expect(result[1].count).toBe(3);

    // payment: 2 + 1 = 3
    expect(result[3].count).toBe(3);

    // followup_complete: 1
    expect(result[9].count).toBe(1);
    expect(result[9].percentage).toBe(17); // Math.round(1/6 * 100)
  });

  it('handles single client at final stage', () => {
    const counts = new Map([['followup_complete', 1]]);
    const result = buildFunnelFromCounts(STAGES, counts, 1);

    // Every stage should show 1 (that client passed through all stages)
    for (const stage of result) {
      expect(stage.count).toBe(1);
      expect(stage.percentage).toBe(100);
    }
  });

  it('handles all clients at inquiry only', () => {
    const counts = new Map([['inquiry', 5]]);
    const result = buildFunnelFromCounts(STAGES, counts, 5);

    expect(result[0].count).toBe(5);
    expect(result[0].percentage).toBe(100);
    expect(result[1].count).toBe(0);
    expect(result[1].percentage).toBe(0);
  });

  it('returns correct stage IDs and labels', () => {
    const result = buildFunnelFromCounts(STAGES, new Map(), 0);
    expect(result[0].stageId).toBe('inquiry');
    expect(result[0].label).toBe('Inquiry');
    expect(result[9].stageId).toBe('followup_complete');
    expect(result[9].label).toBe('Follow-Up Complete');
  });

  it('percentages are rounded to nearest integer', () => {
    const counts = new Map([['inquiry', 1], ['followup_complete', 2]]);
    const result = buildFunnelFromCounts(STAGES, counts, 3);
    // followup_complete: 2/3 = 66.67 → 67
    expect(result[9].percentage).toBe(67);
  });
});

// ── conversionRate ───────────────────────────────────────────────────────────

describe('conversionRate', () => {
  it('returns 0 when "from" is 0', () => {
    expect(conversionRate(0, 5)).toBe(0);
  });

  it('returns 100 when from equals to', () => {
    expect(conversionRate(10, 10)).toBe(100);
  });

  it('calculates correct percentage', () => {
    expect(conversionRate(10, 7)).toBe(70);
  });

  it('rounds to nearest integer', () => {
    expect(conversionRate(3, 2)).toBe(67); // 66.67 → 67
  });

  it('handles 0 to 0', () => {
    expect(conversionRate(0, 0)).toBe(0);
  });
});

// ── formatRevenue ────────────────────────────────────────────────────────────

describe('formatRevenue', () => {
  it('formats zero', () => {
    expect(formatRevenue(0)).toBe('$0');
  });

  it('formats small amount', () => {
    expect(formatRevenue(197)).toBe('$197');
  });

  it('formats amount with thousands separator', () => {
    expect(formatRevenue(1576)).toBe('$1,576');
  });

  it('truncates decimals', () => {
    expect(formatRevenue(197.5)).toBe('$198');
  });
});

// ── formatMonthLabel ─────────────────────────────────────────────────────────

describe('formatMonthLabel', () => {
  it('formats YYYY-MM to readable label', () => {
    expect(formatMonthLabel('2026-01')).toBe('Jan 2026');
    expect(formatMonthLabel('2026-02')).toBe('Feb 2026');
    expect(formatMonthLabel('2026-12')).toBe('Dec 2026');
  });

  it('handles all 12 months', () => {
    const expected = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 12; i++) {
      const month = String(i + 1).padStart(2, '0');
      expect(formatMonthLabel(`2026-${month}`)).toBe(`${expected[i]} 2026`);
    }
  });

  it('returns raw string for invalid month', () => {
    expect(formatMonthLabel('2026-13')).toBe('2026-13');
    expect(formatMonthLabel('2026-00')).toBe('2026-00');
  });

  it('returns raw string for malformed input', () => {
    expect(formatMonthLabel('invalid')).toBe('invalid');
  });
});
