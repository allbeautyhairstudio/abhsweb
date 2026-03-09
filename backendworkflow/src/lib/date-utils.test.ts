import { describe, it, expect, vi, afterEach } from 'vitest';
import { daysUntil, formatRelativeDate, isOverdue, formatDisplayDate } from './date-utils';

// Helper to create date strings relative to "today"
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil(dateOffset(0))).toBe(0);
  });

  it('returns 1 for tomorrow', () => {
    expect(daysUntil(dateOffset(1))).toBe(1);
  });

  it('returns positive for future dates', () => {
    expect(daysUntil(dateOffset(5))).toBe(5);
  });

  it('returns negative for past dates', () => {
    expect(daysUntil(dateOffset(-3))).toBe(-3);
  });

  it('returns null for null input', () => {
    expect(daysUntil(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(daysUntil('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(daysUntil('not-a-date')).toBeNull();
  });
});

describe('formatRelativeDate', () => {
  it('returns "Today" for today', () => {
    expect(formatRelativeDate(dateOffset(0))).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow', () => {
    expect(formatRelativeDate(dateOffset(1))).toBe('Tomorrow');
  });

  it('returns "In N days" for future dates', () => {
    expect(formatRelativeDate(dateOffset(3))).toBe('In 3 days');
  });

  it('returns "1 day ago" for yesterday', () => {
    expect(formatRelativeDate(dateOffset(-1))).toBe('1 day ago');
  });

  it('returns "N days ago" for past dates', () => {
    expect(formatRelativeDate(dateOffset(-5))).toBe('5 days ago');
  });

  it('returns "—" for null', () => {
    expect(formatRelativeDate(null)).toBe('—');
  });

  it('returns "—" for empty string', () => {
    expect(formatRelativeDate('')).toBe('—');
  });

  it('returns "—" for invalid date', () => {
    expect(formatRelativeDate('garbage')).toBe('—');
  });
});

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    expect(isOverdue(dateOffset(-1))).toBe(true);
  });

  it('returns true for dates further in the past', () => {
    expect(isOverdue(dateOffset(-30))).toBe(true);
  });

  it('returns false for today', () => {
    expect(isOverdue(dateOffset(0))).toBe(false);
  });

  it('returns false for future dates', () => {
    expect(isOverdue(dateOffset(3))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isOverdue('')).toBe(false);
  });
});

describe('formatDisplayDate', () => {
  it('formats a valid date', () => {
    // Use a fixed date to test formatting
    const result = formatDisplayDate('2026-02-23');
    expect(result).toBe('Feb 23, 2026');
  });

  it('formats another valid date', () => {
    expect(formatDisplayDate('2025-12-01')).toBe('Dec 1, 2025');
  });

  it('returns "—" for null', () => {
    expect(formatDisplayDate(null)).toBe('—');
  });

  it('returns "—" for empty string', () => {
    expect(formatDisplayDate('')).toBe('—');
  });

  it('returns "—" for invalid date', () => {
    expect(formatDisplayDate('xyz')).toBe('—');
  });
});
