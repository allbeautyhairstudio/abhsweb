import { getDb } from '../db';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string;       // YYYY-MM
  total: number;
  clientCount: number;
}

export interface ReferralSummary {
  totalReferralsGiven: number;
  referralSources: Array<{ source: string; count: number }>;
}

export interface TierBreakdown {
  tier: string;
  count: number;
}

export interface ServiceTypeBreakdown {
  serviceType: string;
  count: number;
}

export interface FunnelStage {
  stageId: string;
  label: string;
  count: number;
  percentage: number;
}

// ── Query Functions ──────────────────────────────────────────────────────────

export function getTotalRevenue(): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM revenue_entries
  `).get() as { total: number };
  return row.total;
}

export function getRevenueByMonth(months: number = 12): MonthlyRevenue[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      COALESCE(SUM(amount), 0) as total,
      COUNT(DISTINCT client_id) as clientCount
    FROM revenue_entries
    WHERE date >= date('now', '-' || ? || ' months', 'start of month')
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
  `).all(months) as MonthlyRevenue[];
}

export function getCompletedClientCount(): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM clients WHERE status = 'followup_complete'
  `).get() as { count: number };
  return row.count;
}

export function getReferralSummary(): ReferralSummary {
  const db = getDb();

  const totalRow = db.prepare(`
    SELECT COALESCE(SUM(referrals_given), 0) as total FROM clients
  `).get() as { total: number };

  const sources = db.prepare(`
    SELECT referral_source as source, COUNT(*) as count
    FROM clients
    WHERE referral_source IS NOT NULL AND referral_source != ''
    GROUP BY referral_source
    ORDER BY count DESC
  `).all() as Array<{ source: string; count: number }>;

  return {
    totalReferralsGiven: totalRow.total,
    referralSources: sources,
  };
}

export function getClientsByPricingTier(): TierBreakdown[] {
  const db = getDb();
  return db.prepare(`
    SELECT COALESCE(pricing_tier, 'unset') as tier, COUNT(*) as count
    FROM clients
    GROUP BY pricing_tier
    ORDER BY count DESC
  `).all() as TierBreakdown[];
}

export function getClientsByServiceType(limit: number = 10): ServiceTypeBreakdown[] {
  const db = getDb();
  return db.prepare(`
    SELECT q05_service_type as serviceType, COUNT(*) as count
    FROM clients
    WHERE q05_service_type IS NOT NULL AND q05_service_type != ''
    GROUP BY q05_service_type
    ORDER BY count DESC
    LIMIT ?
  `).all(limit) as ServiceTypeBreakdown[];
}

export function getAverageCompletionDays(): number | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT AVG(julianday(followup_complete_date) - julianday(inquiry_date)) as avgDays
    FROM clients
    WHERE status = 'followup_complete'
      AND inquiry_date IS NOT NULL
      AND followup_complete_date IS NOT NULL
  `).get() as { avgDays: number | null };
  return row.avgDays !== null ? Math.round(row.avgDays) : null;
}

export function getPipelineConversion(): FunnelStage[] {
  const db = getDb();

  // Ordered stages — a client "reached" a stage if their status is at or past that stage
  const STAGE_ORDER = [
    { id: 'inquiry', label: 'Inquiry' },
    { id: 'intake_submitted', label: 'Intake Submitted' },
    { id: 'fit_assessment', label: 'AI Summary' },
    { id: 'payment', label: 'Payment' },
    { id: 'analysis_prep', label: 'Analysis & Prep' },
    { id: 'session_scheduled', label: 'Session Scheduled' },
    { id: 'session_complete', label: 'Session Complete' },
    { id: 'deliverables_sent', label: 'Deliverables Sent' },
    { id: 'followup_scheduled', label: 'Follow-Up Scheduled' },
    { id: 'followup_complete', label: 'Follow-Up Complete' },
  ];

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
  const total = totalRow.count;
  if (total === 0) return STAGE_ORDER.map(s => ({ stageId: s.id, label: s.label, count: 0, percentage: 0 }));

  // Count clients who have reached at least this stage (current stage index >= this stage index)
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count FROM clients GROUP BY status
  `).all() as Array<{ status: string; count: number }>;

  const statusMap = new Map<string, number>();
  for (const row of statusCounts) {
    statusMap.set(row.status, row.count);
  }

  return buildFunnelFromCounts(STAGE_ORDER, statusMap, total);
}

// ── Pure Computation (exported for testing) ──────────────────────────────────

/** Build cumulative funnel: clients at stage N = clients AT stage N + clients at any stage > N */
export function buildFunnelFromCounts(
  stages: Array<{ id: string; label: string }>,
  statusCounts: Map<string, number>,
  total: number,
): FunnelStage[] {
  // First, compute cumulative counts (from bottom up)
  const rawCounts = stages.map(s => statusCounts.get(s.id) || 0);

  // Cumulative: clients who reached stage i = sum of all clients at stage i or later
  const cumulative: number[] = new Array(stages.length).fill(0);
  let runningTotal = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    runningTotal += rawCounts[i];
    cumulative[i] = runningTotal;
  }

  return stages.map((stage, i) => ({
    stageId: stage.id,
    label: stage.label,
    count: cumulative[i],
    percentage: total > 0 ? Math.round((cumulative[i] / total) * 100) : 0,
  }));
}

/** Calculate conversion rate between two adjacent funnel values */
export function conversionRate(from: number, to: number): number {
  if (from === 0) return 0;
  return Math.round((to / from) * 100);
}

/** Format a revenue number as a display string */
export function formatRevenue(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Format month string (YYYY-MM) to readable label */
export function formatMonthLabel(yearMonth: string): string {
  const parts = yearMonth.split('-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return yearMonth;
  const [year, month] = parts;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return yearMonth;
  return `${monthNames[monthIndex]} ${year}`;
}
