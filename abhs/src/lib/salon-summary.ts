/**
 * Salon AI Summary Engine — pure functions for scoring salon intake submissions.
 * Parses the formatted intake note (stored in client_notes as note_type='interest_flag')
 * and scores across 3 axes: Consultation Readiness, Complexity, and Engagement.
 *
 * No side effects, no DB/API calls — fully unit-testable.
 */

import {
  READINESS_WEIGHTS,
  GOALS_DETAIL_THRESHOLD,
  GOALS_PARTIAL_THRESHOLD,
  COMPLEXITY_WEIGHTS,
  COLOR_CORRECTION_SIGNALS,
  CHEMICAL_SIGNALS,
  COMPOUNDING_CONDITIONS,
  ENGAGEMENT_WEIGHTS,
  ENGAGEMENT_GOALS_THRESHOLDS,
  MAJOR_CHANGE_KEYWORDS,
  MEDICAL_HAIR_KEYWORDS,
  GREEN_THRESHOLD,
  YELLOW_THRESHOLD,
  SERVICE_LABELS,
  type SalonFlag,
} from './constants/salon-scoring-rules';

// ─── Types ──────────────────────────────────────────────────

export interface ParsedSalonIntake {
  name: string | null;
  pronouns: string | null;
  email: string | null;
  phone: string | null;
  preferredContact: string | null;
  serviceInterest: string[];
  hairLoveHate: string | null;
  hairTexture: string | null;
  hairLength: string | null;
  hairDensity: string | null;
  hairCondition: string[];
  stylingDescription: string | null;
  dailyRoutine: string | null;
  shampooFrequency: string | null;
  hairHistory: string[];
  colorReaction: string[];
  products: {
    shampoo: string | null;
    conditioner: string | null;
    hairSpray: string | null;
    dryShampoo: string | null;
    heatProtector: string | null;
    other: string | null;
  };
  whatTheyWant: string | null;
  maintenanceFrequency: string | null;
  availability: string[];
  medicalInfo: string | null;
  referralSource: string | null;
}

export interface ScoreBreakdown {
  label: string;
  points: number;
  maxPoints: number;
}

export interface SalonScore {
  score: number;
  maxScore: number;
  label: string;
  breakdowns: ScoreBreakdown[];
}

export interface SalonSummary {
  readiness: SalonScore;
  complexity: SalonScore;
  engagement: SalonScore;
  flags: SalonFlag[];
  highlights: string[];
  overallRating: 'green' | 'yellow' | 'red';
}

// ─── Note Parser ────────────────────────────────────────────

/**
 * Parse a formatted salon intake note back into structured fields.
 * The note uses labeled lines like "Name: John Doe", "Hair Texture: Wavy", etc.
 */
export function parseSalonIntakeNote(noteContent: string): ParsedSalonIntake {
  const lines = noteContent.split('\n');

  function getField(label: string): string | null {
    const prefix = `${label}: `;
    const line = lines.find(l => l.startsWith(prefix));
    if (!line) return null;
    const val = line.slice(prefix.length).trim();
    return val || null;
  }

  function getList(label: string): string[] {
    const val = getField(label);
    if (!val) return [];
    return val.split(', ').map(s => s.trim()).filter(Boolean);
  }

  // Products: try individual fields first, fallback to old 'Current Products'
  const shampoo = getField('Shampoo');
  const conditioner = getField('Conditioner');
  const hairSpray = getField('Hair Spray');
  const dryShampoo = getField('Dry Shampoo');
  const heatProtector = getField('Heat Protector');
  const otherProduct = getField('Other Product');
  const hasIndividualProducts = [shampoo, conditioner, hairSpray, dryShampoo, heatProtector, otherProduct].some(Boolean);
  const oldProducts = getField('Current Products');

  return {
    name: getField('Name'),
    pronouns: getField('Pronouns'),
    email: getField('Email'),
    phone: getField('Phone'),
    preferredContact: getField('Preferred Contact'),
    serviceInterest: getList('Service Interest'),
    hairLoveHate: getField('Love/Hate'),
    hairTexture: getField('Texture'),
    hairLength: getField('Length'),
    hairDensity: getField('Density'),
    hairCondition: getList('Condition'),
    stylingDescription: getField('Self-Description'),
    dailyRoutine: getField('Daily Routine'),
    shampooFrequency: getField('Shampoo Frequency'),
    hairHistory: getList('Treatments'),
    colorReaction: getList('Color Reaction'),
    products: {
      shampoo,
      conditioner,
      hairSpray,
      dryShampoo,
      heatProtector,
      other: hasIndividualProducts ? otherProduct : oldProducts,
    },
    whatTheyWant: getField('What They Want'),
    maintenanceFrequency: getField('Maintenance Frequency'),
    availability: getList('Availability'),
    medicalInfo: getField('Medical/Allergy Info'),
    referralSource: getField('Referral Source'),
  };
}

// ─── Word Count Helper ──────────────────────────────────────

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Scoring Functions ──────────────────────────────────────

/**
 * Axis 1: Consultation Readiness (0-100)
 * Measures how prepared the client is for a consultation.
 */
export function calculateReadinessScore(intake: ParsedSalonIntake): SalonScore {
  const breakdowns: ScoreBreakdown[] = [];
  let total = 0;

  // Service interest specified
  const servicePoints = intake.serviceInterest.length > 0 ? READINESS_WEIGHTS.serviceInterest : 0;
  total += servicePoints;
  breakdowns.push({ label: 'Service interest specified', points: servicePoints, maxPoints: READINESS_WEIGHTS.serviceInterest });

  // Hair profile complete (texture + length + density)
  const profileParts = [intake.hairTexture, intake.hairLength, intake.hairDensity].filter(Boolean).length;
  const profilePoints = profileParts === 3
    ? READINESS_WEIGHTS.hairProfileComplete
    : Math.round((profileParts / 3) * READINESS_WEIGHTS.hairProfileComplete);
  total += profilePoints;
  breakdowns.push({ label: 'Hair profile complete', points: profilePoints, maxPoints: READINESS_WEIGHTS.hairProfileComplete });

  // Hair history provided
  const historyPoints = intake.hairHistory.length > 0 ? READINESS_WEIGHTS.hairHistory : 0;
  total += historyPoints;
  breakdowns.push({ label: 'Hair history provided', points: historyPoints, maxPoints: READINESS_WEIGHTS.hairHistory });

  // Goals described with detail
  const goalWords = wordCount(intake.whatTheyWant);
  let goalPoints = 0;
  if (goalWords >= GOALS_DETAIL_THRESHOLD) goalPoints = READINESS_WEIGHTS.goalsDescribed;
  else if (goalWords >= GOALS_PARTIAL_THRESHOLD) goalPoints = Math.round(READINESS_WEIGHTS.goalsDescribed * 0.6);
  else if (goalWords > 0) goalPoints = Math.round(READINESS_WEIGHTS.goalsDescribed * 0.3);
  total += goalPoints;
  breakdowns.push({ label: 'Goals described', points: goalPoints, maxPoints: READINESS_WEIGHTS.goalsDescribed });

  // Availability provided
  const availPoints = intake.availability.length > 0 ? READINESS_WEIGHTS.availability : 0;
  total += availPoints;
  breakdowns.push({ label: 'Availability provided', points: availPoints, maxPoints: READINESS_WEIGHTS.availability });

  // Contact info complete (name + email + phone)
  const contactParts = [intake.name, intake.email, intake.phone].filter(Boolean).length;
  const contactPoints = contactParts === 3
    ? READINESS_WEIGHTS.contactComplete
    : Math.round((contactParts / 3) * READINESS_WEIGHTS.contactComplete);
  total += contactPoints;
  breakdowns.push({ label: 'Contact info complete', points: contactPoints, maxPoints: READINESS_WEIGHTS.contactComplete });

  const maxScore = 100;
  return {
    score: total,
    maxScore,
    label: total >= 70 ? 'Strong' : total >= 40 ? 'Moderate' : 'Low',
    breakdowns,
  };
}

/**
 * Axis 2: Complexity Assessment (0-100)
 * Measures how complex the client's needs are. NOT a rejection signal.
 */
export function calculateComplexityScore(intake: ParsedSalonIntake): SalonScore {
  const breakdowns: ScoreBreakdown[] = [];
  let total = 0;

  // Color correction signals
  const hasColorCorrection = intake.hairHistory.some(h => COLOR_CORRECTION_SIGNALS.has(h));
  const colorPoints = hasColorCorrection ? COMPLEXITY_WEIGHTS.colorCorrection : 0;
  total += colorPoints;
  breakdowns.push({ label: 'Color correction history', points: colorPoints, maxPoints: COMPLEXITY_WEIGHTS.colorCorrection });

  // Multiple hair conditions
  const conditionCount = intake.hairCondition.filter(c => COMPOUNDING_CONDITIONS.has(c)).length;
  const conditionPoints = conditionCount >= 3
    ? COMPLEXITY_WEIGHTS.multipleConditions
    : conditionCount >= 2
      ? Math.round(COMPLEXITY_WEIGHTS.multipleConditions * 0.7)
      : conditionCount === 1
        ? Math.round(COMPLEXITY_WEIGHTS.multipleConditions * 0.3)
        : 0;
  total += conditionPoints;
  breakdowns.push({ label: 'Hair condition complexity', points: conditionPoints, maxPoints: COMPLEXITY_WEIGHTS.multipleConditions });

  // Chemical history
  const hasChemical = intake.hairHistory.some(h => CHEMICAL_SIGNALS.has(h));
  const chemPoints = hasChemical ? COMPLEXITY_WEIGHTS.chemicalHistory : 0;
  total += chemPoints;
  breakdowns.push({ label: 'Chemical treatment history', points: chemPoints, maxPoints: COMPLEXITY_WEIGHTS.chemicalHistory });

  // Color reaction history (handles old 'Yes' and new specific reactions like 'Itching', 'Burning')
  const hasReaction = intake.colorReaction.some(r => !['No Reaction', 'Not Sure'].includes(r));
  const reactionPoints = hasReaction ? COMPLEXITY_WEIGHTS.colorReaction : 0;
  total += reactionPoints;
  breakdowns.push({ label: 'Prior color reaction', points: reactionPoints, maxPoints: COMPLEXITY_WEIGHTS.colorReaction });

  // Medical/allergy info present
  const hasMedical = intake.medicalInfo && intake.medicalInfo !== 'None provided';
  const medPoints = hasMedical ? COMPLEXITY_WEIGHTS.medicalInfo : 0;
  total += medPoints;
  breakdowns.push({ label: 'Medical/allergy info', points: medPoints, maxPoints: COMPLEXITY_WEIGHTS.medicalInfo });

  const maxScore = 100;
  return {
    score: total,
    maxScore,
    label: total >= 50 ? 'High' : total >= 25 ? 'Moderate' : 'Low',
    breakdowns,
  };
}

/**
 * Axis 3: Engagement Score (0-100)
 * Measures how thoughtfully the client completed the intake form.
 */
export function calculateEngagementScore(
  intake: ParsedSalonIntake,
  hasPhotos: boolean = false
): SalonScore {
  const breakdowns: ScoreBreakdown[] = [];
  let total = 0;

  // Goal description detail
  const goalWords = wordCount(intake.whatTheyWant);
  let goalPoints = 0;
  if (goalWords >= ENGAGEMENT_GOALS_THRESHOLDS.detailed) goalPoints = ENGAGEMENT_WEIGHTS.goalsDetail;
  else if (goalWords >= ENGAGEMENT_GOALS_THRESHOLDS.moderate) goalPoints = 25;
  else if (goalWords >= ENGAGEMENT_GOALS_THRESHOLDS.minimal) goalPoints = 10;
  total += goalPoints;
  breakdowns.push({ label: 'Goal description detail', points: goalPoints, maxPoints: ENGAGEMENT_WEIGHTS.goalsDetail });

  // Hair love/hate filled
  const loveHatePoints = intake.hairLoveHate ? ENGAGEMENT_WEIGHTS.hairLoveHate : 0;
  total += loveHatePoints;
  breakdowns.push({ label: 'Hair love/hate shared', points: loveHatePoints, maxPoints: ENGAGEMENT_WEIGHTS.hairLoveHate });

  // Products described (new: 6 individual fields; old: products.other from currentProducts fallback)
  const hasProducts = [
    intake.products.shampoo,
    intake.products.conditioner,
    intake.products.hairSpray,
    intake.products.dryShampoo,
    intake.products.heatProtector,
    intake.products.other,
  ].some(Boolean);
  const productPoints = hasProducts ? ENGAGEMENT_WEIGHTS.productsDescribed : 0;
  total += productPoints;
  breakdowns.push({ label: 'Products described', points: productPoints, maxPoints: ENGAGEMENT_WEIGHTS.productsDescribed });

  // Medical info proactively shared
  const medicalPoints = intake.medicalInfo && intake.medicalInfo !== 'None provided'
    ? ENGAGEMENT_WEIGHTS.medicalProactive
    : 0;
  total += medicalPoints;
  breakdowns.push({ label: 'Medical info shared proactively', points: medicalPoints, maxPoints: ENGAGEMENT_WEIGHTS.medicalProactive });

  // Photos uploaded
  const photoPoints = hasPhotos ? ENGAGEMENT_WEIGHTS.photosUploaded : 0;
  total += photoPoints;
  breakdowns.push({ label: 'Photos uploaded', points: photoPoints, maxPoints: ENGAGEMENT_WEIGHTS.photosUploaded });

  const maxScore = 100;
  return {
    score: total,
    maxScore,
    label: total >= 65 ? 'Strong' : total >= 35 ? 'Moderate' : 'Low',
    breakdowns,
  };
}

// ─── Flag Detection ─────────────────────────────────────────

/**
 * Detect salon-specific flags from intake data.
 * Flags are informational signals for Karli — not rejection criteria.
 */
export function detectFlags(intake: ParsedSalonIntake): SalonFlag[] {
  const flags: SalonFlag[] = [];

  // Color correction likely
  const hasColorCorrection = intake.hairHistory.some(h => COLOR_CORRECTION_SIGNALS.has(h));
  const hasDamage = intake.hairCondition.some(c =>
    c === 'Damaged' || c === 'Color Treated' || c === 'Chemically Treated'
  );
  if (hasColorCorrection && hasDamage) {
    flags.push({ type: 'HEADS_UP', label: 'Color correction likely — review hair history carefully' });
  }

  // Allergy/reaction history (handles old 'Yes' and new specific reactions)
  const hasColorReaction = intake.colorReaction.some(r => !['No Reaction', 'Not Sure'].includes(r));
  if (hasColorReaction) {
    flags.push({ type: 'HEADS_UP', label: 'Prior color reaction — patch test required' });
  }
  if (intake.medicalInfo && intake.medicalInfo !== 'None provided') {
    const lower = intake.medicalInfo.toLowerCase();
    if (lower.includes('allergy') || lower.includes('allergic') || lower.includes('reaction')) {
      flags.push({ type: 'HEADS_UP', label: 'Allergy/sensitivity noted in medical info' });
    }

    // Scan for hair-relevant medical conditions and medications
    const matchedMedical = MEDICAL_HAIR_KEYWORDS.filter(entry => lower.includes(entry.keyword));
    for (const match of matchedMedical) {
      // Skip if we already flagged allergy above for this same info
      const isAllergyDupe = (match.keyword === 'allergy' || match.keyword === 'allergic');
      if (!isAllergyDupe) {
        flags.push({ type: 'NOTE', label: `Medical note: ${match.context}` });
      }
    }
  }

  // Major change requested
  if (intake.whatTheyWant) {
    const lower = intake.whatTheyWant.toLowerCase();
    if (MAJOR_CHANGE_KEYWORDS.some(kw => lower.includes(kw))) {
      flags.push({ type: 'HEADS_UP', label: 'Major change requested — manage expectations' });
    }
  }

  // Good fit: low-maintenance returning client
  const goodFitFrequencies = ['Every 4 6 Weeks', '3 5 Weeks', '6 8 Weeks'];
  const goodFitStyles = ['Low Maintenance', 'Simple Styler', 'Simple Predictable'];
  if (
    intake.maintenanceFrequency && goodFitFrequencies.includes(intake.maintenanceFrequency) &&
    intake.stylingDescription && goodFitStyles.includes(intake.stylingDescription)
  ) {
    flags.push({ type: 'GOOD_FIT', label: 'Low-maintenance client with regular schedule' });
  }

  // Limited availability
  if (intake.availability.length === 1) {
    flags.push({ type: 'NOTE', label: `Limited availability — ${intake.availability[0]} only` });
  }

  return flags;
}

// ─── Highlights ─────────────────────────────────────────────

/**
 * Generate 4-6 decision-relevant highlights from intake data.
 */
export function generateHighlights(intake: ParsedSalonIntake): string[] {
  const highlights: string[] = [];

  // Service interest (array — use first value for label lookup, join all for display)
  if (intake.serviceInterest.length > 0) {
    const firstLabel = SERVICE_LABELS[intake.serviceInterest[0]] || intake.serviceInterest[0];
    const display = intake.serviceInterest.length === 1
      ? firstLabel
      : intake.serviceInterest.join(', ');
    highlights.push(`Looking for: ${display}`);
  }

  // Hair type summary
  const hairParts = [intake.hairTexture, intake.hairLength, intake.hairDensity].filter(Boolean);
  if (hairParts.length > 0) {
    highlights.push(`Hair type: ${hairParts.join(', ')}`);
  }

  // Conditions
  if (intake.hairCondition.length > 0) {
    highlights.push(`Condition: ${intake.hairCondition.join(', ')}`);
  }

  // What they want (first 50 words)
  if (intake.whatTheyWant) {
    const words = intake.whatTheyWant.split(/\s+/);
    const truncated = words.length > 50
      ? words.slice(0, 50).join(' ') + '...'
      : intake.whatTheyWant;
    highlights.push(`Goal: ${truncated}`);
  }

  // Maintenance frequency
  if (intake.maintenanceFrequency) {
    highlights.push(`Maintenance: ${intake.maintenanceFrequency}`);
  }

  // Medical info (when clinically relevant)
  if (intake.medicalInfo && intake.medicalInfo !== 'None provided') {
    highlights.push(`Medical note: ${intake.medicalInfo}`);
  }

  // Referral source
  if (intake.referralSource && intake.referralSource !== 'Not specified') {
    highlights.push(`Referred by: ${intake.referralSource}`);
  }

  return highlights;
}

// ─── Main Assessment ────────────────────────────────────────

/**
 * Generate a complete salon summary from an intake note.
 * Pure function — pass in parsed intake + whether photos exist.
 */
export function assessSalonIntake(
  intake: ParsedSalonIntake,
  hasPhotos: boolean = false
): SalonSummary {
  const readiness = calculateReadinessScore(intake);
  const complexity = calculateComplexityScore(intake);
  const engagement = calculateEngagementScore(intake, hasPhotos);
  const flags = detectFlags(intake);
  const highlights = generateHighlights(intake);

  // Overall rating
  const hasColorCorrectionFlag = flags.some(f =>
    f.type === 'HEADS_UP' && f.label.includes('Color correction')
  );

  let overallRating: 'green' | 'yellow' | 'red';
  if (readiness.score < YELLOW_THRESHOLD) {
    overallRating = 'red';
  } else if (readiness.score >= GREEN_THRESHOLD && !hasColorCorrectionFlag) {
    overallRating = 'green';
  } else {
    overallRating = 'yellow';
  }

  return {
    readiness,
    complexity,
    engagement,
    flags,
    highlights,
    overallRating,
  };
}
