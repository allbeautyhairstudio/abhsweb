import { differenceInCalendarDays, parseISO, isToday, isTomorrow, isPast, format } from 'date-fns';

/**
 * Calculate days from today to a given date string (YYYY-MM-DD).
 * Returns positive for future, negative for past, 0 for today.
 * Returns null for null/empty input.
 */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return null;
  return differenceInCalendarDays(date, new Date());
}

/**
 * Format date with relative label: "Today", "Tomorrow", "In 3 days", "5 days ago"
 * Returns "—" for null/empty input.
 */
export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return '—';

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';

  const days = differenceInCalendarDays(date, new Date());
  if (days > 1) return `In ${days} days`;
  if (days === -1) return '1 day ago';
  if (days < -1) return `${Math.abs(days)} days ago`;

  return format(date, 'MMM d, yyyy');
}

/**
 * Check if a date is overdue (in the past, not today).
 * Returns false for null/empty or today/future dates.
 */
export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return false;
  return isPast(date) && !isToday(date);
}

/**
 * Format date for display: "Feb 23, 2026"
 * Returns "—" for null/empty input.
 */
export function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return '—';
  return format(date, 'MMM d, yyyy');
}
