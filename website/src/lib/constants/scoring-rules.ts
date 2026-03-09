/**
 * Scoring rules and constants for the Fit Assessment engine.
 * All scoring weights, threshold maps, and rule definitions live here.
 * The scoring engine (scoring.ts) applies these — no logic in this file.
 */

// --- Service Fit Score Weights (total: 100) ---

export const SERVICE_FIT_WEIGHTS = {
  hasServiceType: 20,
  hasServicesDescription: 15,
  hasClients: 15,
  clientVolume: 10,
  goalsAlign: 25,
  marketingIsGap: 15,
} as const;

// Marketing goals that indicate alignment with this service (q12)
export const ALIGNED_GOALS = new Set([
  'more_clients',
  'consistent_bookings',
  'better_fit',
  'increase_pricing',
]);

// Marketing approaches that indicate marketing is a gap (q21)
export const GAP_APPROACHES = new Set([
  'no_marketing',
  'occasional',
  'regular_no_results',
  'referrals_only',
  'tried_unclear',
  'overwhelmed',
]);

// --- Readiness Score Weights (total: 100) ---

export const READINESS_WEIGHTS = {
  timeAvailable: 30,
  confidence: 25,
  constraintManageable: 25,
  techComfort: 20,
} as const;

// q38 time_for_marketing → readiness points
export const TIME_SCORE_MAP: Record<string, number> = {
  'none': 0,
  'under_30min': 10,
  '30_60min': 20,
  '1_2hrs': 25,
  '2plus_hrs': 30,
};

// q39 biggest_constraint → readiness points (lower = harder constraint)
export const CONSTRAINT_SCORE_MAP: Record<string, number> = {
  'burnout': 5,
  'time': 10,
  'confidence': 12,
  'consistency': 15,
  'money': 18,
  'clarity': 20,
  'direction': 22,
};

// q35 tech_comfort → readiness points
export const TECH_COMFORT_MAP: Record<string, number> = {
  'avoid': 5,
  'social_only': 10,
  'comfortable_posting': 15,
  'likes_learning': 18,
  'excited_ai': 20,
};

// --- Engagement Score Weights (total: 100) ---

export const ENGAGEMENT_WEIGHTS = {
  openTextDetail: 40,
  optionalFieldsFilled: 30,
  specificityBonus: 30,
} as const;

// Word count thresholds for open-text scoring
export const WORD_COUNT_THRESHOLDS = {
  minimal: 5,
  moderate: 15,
  detailed: 30,
} as const;

// Open-text fields scored for engagement
export const SCORED_TEXT_FIELDS = [
  'q14_ideal_client',
  'q16_problems_solved',
  'q19_what_works',
  'q40_success_90_days',
] as const;

// Optional fields that indicate engagement when filled
export const OPTIONAL_FIELDS = [
  'q31_sell_less_of',
  'q43_other_social',
  'q47_anything_else',
] as const;

// Specificity check fields
export const SPECIFICITY_FIELDS = {
  primary: 'q40_success_90_days',
  secondary: 'q14_ideal_client',
  primaryThreshold: 20,
  secondaryThreshold: 10,
} as const;

// --- Archetype Detection ---

export const OVERWHELMED_POSTER_SOCIAL = new Set(['yes', 'sometimes']);
export const OVERWHELMED_POSTER_APPROACH = new Set(['regular_no_results', 'overwhelmed']);
export const AVOIDER_SOCIAL = new Set(['rarely_never']);

// --- Flag Thresholds ---

export const FLAG_BURNOUT_CONSTRAINTS = new Set(['burnout']);
export const FLAG_BURNOUT_STAGES = new Set(['overwhelmed']);
export const FLAG_LOW_CONFIDENCE_THRESHOLD = 2;
export const FLAG_HIGH_OPPORTUNITY_SCORE_THRESHOLD = 70;
export const FLAG_NO_TIME_VALUES = new Set(['none']);

// --- Score Label Thresholds ---

export const SCORE_THRESHOLDS = {
  strong: 70,
  moderate: 40,
} as const;

// --- Overall Rating Thresholds ---

export const OVERALL_RATING_RULES = {
  redServiceFitMax: 40,
  greenServiceFitMin: 70,
  greenReadinessMin: 40,
} as const;

// --- Human-Readable Labels ---

export const YEARS_LABELS: Record<string, string> = {
  'under_1yr': 'less than 1 year',
  '1_3yr': '1-3 years',
  '3_7yr': '3-7 years',
  '7plus': '7+ years',
};

export const STAGE_LABELS: Record<string, string> = {
  'just_starting': 'Just Starting',
  'inconsistent': 'Inconsistent',
  'fully_booked': 'Fully Booked',
  'overwhelmed': 'Overwhelmed',
  'stagnant': 'Stagnant',
};

export const GOAL_LABELS: Record<string, string> = {
  'more_clients': 'More clients',
  'consistent_bookings': 'Consistent bookings',
  'better_fit': 'Better-fit clients',
  'increase_pricing': 'Increase pricing',
  'reduce_workload': 'Reduce workload',
};

export const TIME_LABELS: Record<string, string> = {
  'none': 'No time right now',
  'under_30min': 'Under 30 min/week',
  '30_60min': '30-60 min/week',
  '1_2hrs': '1-2 hrs/week',
  '2plus_hrs': '2+ hrs/week',
};

export const SOCIAL_LABELS: Record<string, string> = {
  'yes': 'Active on social',
  'sometimes': 'Sometimes active',
  'rarely_never': 'Rarely/never posts',
};

export const REVIEW_COUNT_LABELS: Record<string, string> = {
  'no_profile': 'No Google profile',
  '0': '0 reviews',
  '1_10': '1-10 reviews',
  '11_25': '11-25 reviews',
  '25_50': '25-50 reviews',
  '50plus': '50+ reviews',
};

// --- Decline Email Template ---

export const DECLINE_EMAIL_TEMPLATE = `Hi [CLIENT_NAME],

Thank you so much for taking the time to fill out the intake form. I really appreciate you sharing where you're at with your business.

After reviewing your responses, I want to be honest with you — I don't think a marketing reset is the right fit for where you are right now. [REASON]

That doesn't mean anything is wrong with you or your business. It just means this particular service isn't the best use of your investment at this stage.

[ALTERNATIVE]

I'm rooting for you. If things shift and this feels like a better fit down the road, my door is always open.

With care,
Karli`;
