/**
 * Scoring rules for the Salon AI Summary engine.
 * All weights, thresholds, and rule definitions live here.
 * The engine (salon-summary.ts) applies these — no logic in this file.
 */

// ─── Consultation Readiness Weights (total: 100) ────────────

export const READINESS_WEIGHTS = {
  serviceInterest: 20,
  hairProfileComplete: 20,
  hairHistory: 15,
  goalsDescribed: 25,
  availability: 10,
  contactComplete: 10,
} as const;

/** Minimum word count for goals to earn full points. */
export const GOALS_DETAIL_THRESHOLD = 15;
/** Minimum word count for goals to earn partial points. */
export const GOALS_PARTIAL_THRESHOLD = 5;

// ─── Complexity Assessment Weights (total: 100) ─────────────

export const COMPLEXITY_WEIGHTS = {
  colorCorrection: 25,
  multipleConditions: 20,
  chemicalHistory: 20,
  colorReaction: 15,
  medicalInfo: 20,
} as const;

/** Hair history values that signal color correction complexity. */
export const COLOR_CORRECTION_SIGNALS = new Set([
  'Box Dye', 'Bleach Lightener',
  'Box Color', 'Splat', 'Manic Panic', 'Previous Lightening',
]);

/** Hair history values that signal chemical treatment history. */
export const CHEMICAL_SIGNALS = new Set([
  'Keratin', 'Perm', 'Relaxer',
]);

/** Hair conditions that compound complexity. */
export const COMPOUNDING_CONDITIONS = new Set([
  'Damaged', 'Color Treated', 'Chemically Treated', 'Heat Damaged', 'Thinning',
  'Heat Damage', 'Breakage', 'Hair Loss', 'Itchy Scalp', 'Dandruff',
]);

// ─── Engagement Weights (total: 100) ────────────────────────

export const ENGAGEMENT_WEIGHTS = {
  goalsDetail: 40,
  hairLoveHate: 20,
  productsDescribed: 15,
  medicalProactive: 15,
  photosUploaded: 10,
} as const;

/** Word count thresholds for goal detail scoring. */
export const ENGAGEMENT_GOALS_THRESHOLDS = {
  detailed: 30,   // 40 pts
  moderate: 15,    // 25 pts
  minimal: 5,      // 10 pts
} as const;

// ─── Flag Definitions ───────────────────────────────────────

export type SalonFlagType = 'HEADS_UP' | 'GOOD_FIT' | 'NOTE';

export interface SalonFlag {
  type: SalonFlagType;
  label: string;
}

/** Keywords in goals that suggest a major change. */
export const MAJOR_CHANGE_KEYWORDS = [
  'drastic', 'chop', 'completely different', 'big change',
  'total change', 'cut it all', 'shave', 'pixie',
];

// ─── Medical / Hair-Relevant Keywords ───────────────────────

/**
 * Keywords in medical info that signal conditions or medications
 * known to affect hair texture, growth, or chemical processing.
 * Used to surface a NOTE flag so Karli reviews before consultation.
 */
export const MEDICAL_HAIR_KEYWORDS: { keyword: string; context: string }[] = [
  { keyword: 'thyroid', context: 'thyroid condition — can affect hair texture and growth' },
  { keyword: 'levothyroxine', context: 'thyroid medication — may affect hair texture' },
  { keyword: 'synthroid', context: 'thyroid medication — may affect hair texture' },
  { keyword: 'chemo', context: 'chemotherapy history — hair texture may have changed' },
  { keyword: 'pregnant', context: 'pregnancy — hormonal changes affect hair' },
  { keyword: 'pregnancy', context: 'pregnancy — hormonal changes affect hair' },
  { keyword: 'postpartum', context: 'postpartum — shedding and texture changes common' },
  { keyword: 'alopecia', context: 'alopecia — discuss affected areas and sensitivity' },
  { keyword: 'pcos', context: 'PCOS — hormonal hair changes common' },
  { keyword: 'iron deficien', context: 'iron deficiency — can cause thinning and texture changes' },
  { keyword: 'anemia', context: 'anemia — can cause thinning and breakage' },
  { keyword: 'autoimmune', context: 'autoimmune condition — may affect hair and scalp' },
  { keyword: 'lupus', context: 'lupus — can cause hair loss and sensitivity' },
  { keyword: 'hormone', context: 'hormonal factor — may affect hair texture and growth' },
  { keyword: 'birth control', context: 'birth control — can affect hair thickness and texture' },
  { keyword: 'accutane', context: 'Accutane — can cause dryness and fragility' },
  { keyword: 'isotretinoin', context: 'isotretinoin — can cause dryness and fragility' },
  { keyword: 'minoxidil', context: 'minoxidil use — discuss hair growth treatment' },
  { keyword: 'rogaine', context: 'Rogaine use — discuss hair growth treatment' },
  { keyword: 'scalp', context: 'scalp condition noted — assess before chemical services' },
  { keyword: 'psoriasis', context: 'psoriasis — check scalp before chemical services' },
  { keyword: 'eczema', context: 'eczema — check scalp sensitivity before processing' },
  { keyword: 'dermatitis', context: 'dermatitis — check scalp before chemical services' },
  { keyword: 'seizure', context: 'seizure condition — be aware during service' },
  { keyword: 'epilep', context: 'epilepsy — be aware during service' },
  { keyword: 'blood thin', context: 'blood thinner — note for any scalp-close work' },
  { keyword: 'diabetes', context: 'diabetes — slower healing, be gentle with scalp' },
];

// ─── Overall Rating Thresholds ──────────────────────────────

/** Readiness score at or above = green (if no complexity flags). */
export const GREEN_THRESHOLD = 60;
/** Readiness score at or above = yellow. Below = red. */
export const YELLOW_THRESHOLD = 40;

// ─── Service Interest Labels ────────────────────────────────

export const SERVICE_LABELS: Record<string, string> = {
  'Cut': 'Haircut',
  'Color': 'Color Service',
  'Cut And Color': 'Cut & Color',
  'Consultation': 'Consultation Only',
  'Not Sure': 'Not Sure Yet',
  'Haircut & Style': 'Haircut & Style',
  'Low Maintenance Color': 'Low Maintenance Color',
  'Lived In Dimensional Color': 'Lived-In Dimensional Color',
  'Mini Service': 'Mini Service',
  'Other Not Sure': 'Not Sure Yet',
};
