/**
 * Fit Assessment Scoring Engine
 *
 * Pure functions that analyze intake data and produce fit scores,
 * archetype detection, flags, and highlights. No side effects,
 * no database calls, no API calls — just logic.
 *
 * Ethical principle: scores measure "is this service right for
 * your situation" — NOT "are you good enough."
 */

import {
  SERVICE_FIT_WEIGHTS,
  ALIGNED_GOALS,
  GAP_APPROACHES,
  READINESS_WEIGHTS,
  TIME_SCORE_MAP,
  CONSTRAINT_SCORE_MAP,
  TECH_COMFORT_MAP,
  ENGAGEMENT_WEIGHTS,
  WORD_COUNT_THRESHOLDS,
  SCORED_TEXT_FIELDS,
  OPTIONAL_FIELDS,
  SPECIFICITY_FIELDS,
  OVERWHELMED_POSTER_SOCIAL,
  OVERWHELMED_POSTER_APPROACH,
  AVOIDER_SOCIAL,
  FLAG_BURNOUT_CONSTRAINTS,
  FLAG_BURNOUT_STAGES,
  FLAG_LOW_CONFIDENCE_THRESHOLD,
  FLAG_HIGH_OPPORTUNITY_SCORE_THRESHOLD,
  FLAG_NO_TIME_VALUES,
  SCORE_THRESHOLDS,
  OVERALL_RATING_RULES,
  YEARS_LABELS,
  STAGE_LABELS,
  GOAL_LABELS,
  TIME_LABELS,
  SOCIAL_LABELS,
  REVIEW_COUNT_LABELS,
} from './constants/scoring-rules';

// --- Types ---

export type ClientRecord = Record<string, unknown>;

export interface BreakdownItem {
  points: number;
  maxPoints: number;
  reason: string;
}

export interface ScoreResult {
  score: number;
  label: 'Strong' | 'Moderate' | 'Low';
  breakdown: Record<string, BreakdownItem>;
}

export interface ArchetypeResult {
  archetype: 'overwhelmed_poster' | 'avoider' | 'undetermined';
  stage: string | null;
  stageLabel: string | null;
  confidence: 'clear' | 'inferred';
  reasoning: string;
}

export type FlagType = 'WATCH' | 'HIGH_OPPORTUNITY' | 'REDIRECT';

export interface Flag {
  type: FlagType;
  label: string;
  detail: string;
  source: string;
}

export interface FitAssessment {
  serviceFit: ScoreResult;
  readiness: ScoreResult;
  engagement: ScoreResult;
  archetype: ArchetypeResult;
  flags: Flag[];
  highlights: string[];
  overallRating: 'green' | 'yellow' | 'red';
  timestamp: string;
}

// --- Utility ---

/** Count words in a string. Returns 0 for null/undefined/empty. */
export function wordCount(text: string | null | undefined): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

/** Get string value from client record, returning null for empty/missing. */
function str(client: ClientRecord, key: string): string | null {
  const val = client[key];
  if (val === null || val === undefined || val === '') return null;
  return String(val).trim() || null;
}

/** Get numeric value from client record. */
function num(client: ClientRecord, key: string): number | null {
  const val = client[key];
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

/** Convert a raw score to a label based on thresholds. */
function scoreLabel(score: number): 'Strong' | 'Moderate' | 'Low' {
  if (score >= SCORE_THRESHOLDS.strong) return 'Strong';
  if (score >= SCORE_THRESHOLDS.moderate) return 'Moderate';
  return 'Low';
}

/** Safely parse a JSON array string, returning empty array on failure. */
function parseArray(value: unknown): string[] {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

// --- Scoring Functions ---

/**
 * Service Fit: Is this the right service for this person's situation?
 * Scores based on being a service business with identifiable marketing gaps.
 */
export function calculateServiceFitScore(client: ClientRecord): ScoreResult {
  const breakdown: Record<string, BreakdownItem> = {};
  const w = SERVICE_FIT_WEIGHTS;

  // Has service type (q05)
  const serviceType = str(client, 'q05_service_type');
  const serviceTypePoints = serviceType ? w.hasServiceType : 0;
  breakdown.hasServiceType = {
    points: serviceTypePoints,
    maxPoints: w.hasServiceType,
    reason: serviceType ? `Service type: ${serviceType}` : 'No service type provided',
  };

  // Has services description (q07)
  const services = str(client, 'q07_services_most_often');
  const servicesPoints = services ? w.hasServicesDescription : 0;
  breakdown.hasServicesDescription = {
    points: servicesPoints,
    maxPoints: w.hasServicesDescription,
    reason: services ? 'Services described' : 'No services described',
  };

  // Has/had clients (q09 schedule fullness, q18 new clients/month)
  const schedule = str(client, 'q09_schedule_fullness');
  const newClients = str(client, 'q18_new_clients_month');
  const hasClients = (schedule && schedule !== 'under_25') || (newClients && newClients !== '0_2');
  const hasClientsPoints = hasClients ? w.hasClients : 0;
  breakdown.hasClients = {
    points: hasClientsPoints,
    maxPoints: w.hasClients,
    reason: hasClients ? 'Has existing client base' : 'Very early stage or no clients',
  };

  // Client volume (q18)
  const hasVolume = newClients && newClients !== '0_2';
  const volumePoints = hasVolume ? w.clientVolume : 0;
  breakdown.clientVolume = {
    points: volumePoints,
    maxPoints: w.clientVolume,
    reason: hasVolume ? `New clients/month: ${newClients}` : 'Minimal new client volume',
  };

  // Goals align (q12)
  const goal = str(client, 'q12_primary_goal');
  const goalsAlignPoints = goal && ALIGNED_GOALS.has(goal) ? w.goalsAlign : 0;
  breakdown.goalsAlign = {
    points: goalsAlignPoints,
    maxPoints: w.goalsAlign,
    reason: goal
      ? ALIGNED_GOALS.has(goal)
        ? `Goal aligns: ${GOAL_LABELS[goal] ?? goal}`
        : `Goal "${GOAL_LABELS[goal] ?? goal}" is less aligned with marketing reset`
      : 'No primary goal specified',
  };

  // Marketing is a gap (q21)
  const approach = str(client, 'q21_marketing_approach');
  const gapPoints = approach && GAP_APPROACHES.has(approach) ? w.marketingIsGap : 0;
  breakdown.marketingIsGap = {
    points: gapPoints,
    maxPoints: w.marketingIsGap,
    reason: approach
      ? GAP_APPROACHES.has(approach)
        ? 'Marketing gap identified'
        : 'Marketing approach may not have clear gaps'
      : 'No marketing approach specified',
  };

  const score = serviceTypePoints + servicesPoints + hasClientsPoints +
    volumePoints + goalsAlignPoints + gapPoints;

  return { score, label: scoreLabel(score), breakdown };
}

/**
 * Readiness: Can this person act on what they receive?
 * Scores based on time, confidence, constraints, and tech comfort.
 * Note: low scores here create FLAGS, not rejection — this measures
 * readiness to implement, not worthiness.
 */
export function calculateReadinessScore(client: ClientRecord): ScoreResult {
  const breakdown: Record<string, BreakdownItem> = {};
  const w = READINESS_WEIGHTS;

  // Time available (q38)
  const time = str(client, 'q38_time_for_marketing');
  const timePoints = time ? (TIME_SCORE_MAP[time] ?? 15) : 15;
  breakdown.timeAvailable = {
    points: timePoints,
    maxPoints: w.timeAvailable,
    reason: time
      ? `Available time: ${TIME_LABELS[time] ?? time}`
      : 'Time availability not specified (neutral)',
  };

  // Confidence (q13, scale 1-5)
  const confidence = num(client, 'q13_marketing_confidence');
  const confidencePoints = confidence !== null
    ? Math.min(confidence * 5, w.confidence)
    : 10;
  breakdown.confidence = {
    points: confidencePoints,
    maxPoints: w.confidence,
    reason: confidence !== null
      ? `Marketing confidence: ${confidence}/5`
      : 'Confidence not specified (neutral)',
  };

  // Constraint manageable (q39)
  const constraint = str(client, 'q39_biggest_constraint');
  const constraintPoints = constraint
    ? (CONSTRAINT_SCORE_MAP[constraint] ?? 15)
    : w.constraintManageable;
  breakdown.constraintManageable = {
    points: constraintPoints,
    maxPoints: w.constraintManageable,
    reason: constraint
      ? `Biggest constraint: ${constraint}`
      : 'No constraint specified',
  };

  // Tech comfort (q35)
  const tech = str(client, 'q35_tech_comfort');
  const techPoints = tech ? (TECH_COMFORT_MAP[tech] ?? 10) : 10;
  breakdown.techComfort = {
    points: techPoints,
    maxPoints: w.techComfort,
    reason: tech
      ? `Tech comfort: ${tech.replace(/_/g, ' ')}`
      : 'Tech comfort not specified (neutral)',
  };

  const score = timePoints + confidencePoints + constraintPoints + techPoints;

  return { score, label: scoreLabel(score), breakdown };
}

/**
 * Engagement: How thoughtfully did they complete the intake?
 * Higher engagement correlates with higher implementation likelihood.
 */
export function calculateEngagementScore(client: ClientRecord): ScoreResult {
  const breakdown: Record<string, BreakdownItem> = {};
  const w = ENGAGEMENT_WEIGHTS;

  // Open-text detail — average word count of key text fields
  const wordCounts = SCORED_TEXT_FIELDS.map(f => wordCount(str(client, f)));
  const avgWords = wordCounts.length > 0
    ? wordCounts.reduce((sum, c) => sum + c, 0) / wordCounts.length
    : 0;

  let textPoints: number;
  if (avgWords >= WORD_COUNT_THRESHOLDS.detailed) textPoints = w.openTextDetail;
  else if (avgWords >= WORD_COUNT_THRESHOLDS.moderate) textPoints = 30;
  else if (avgWords >= WORD_COUNT_THRESHOLDS.minimal) textPoints = 15;
  else textPoints = 0;

  breakdown.openTextDetail = {
    points: textPoints,
    maxPoints: w.openTextDetail,
    reason: `Average ${Math.round(avgWords)} words across ${SCORED_TEXT_FIELDS.length} open-text fields`,
  };

  // Optional fields filled
  const filledCount = OPTIONAL_FIELDS.filter(f => str(client, f) !== null).length;
  const optionalPoints = Math.round((filledCount / OPTIONAL_FIELDS.length) * w.optionalFieldsFilled);
  breakdown.optionalFieldsFilled = {
    points: optionalPoints,
    maxPoints: w.optionalFieldsFilled,
    reason: `${filledCount} of ${OPTIONAL_FIELDS.length} optional fields filled`,
  };

  // Specificity bonus
  const primaryWords = wordCount(str(client, SPECIFICITY_FIELDS.primary));
  const secondaryWords = wordCount(str(client, SPECIFICITY_FIELDS.secondary));
  const primarySpecific = primaryWords >= SPECIFICITY_FIELDS.primaryThreshold;
  const secondarySpecific = secondaryWords >= SPECIFICITY_FIELDS.secondaryThreshold;

  let specificityPoints: number;
  if (primarySpecific && secondarySpecific) specificityPoints = w.specificityBonus;
  else if (primarySpecific || secondarySpecific) specificityPoints = 15;
  else specificityPoints = 0;

  breakdown.specificityBonus = {
    points: specificityPoints,
    maxPoints: w.specificityBonus,
    reason: primarySpecific && secondarySpecific
      ? 'Detailed vision and ideal client description'
      : primarySpecific || secondarySpecific
        ? 'Some specificity in key fields'
        : 'Key fields lack detail',
  };

  const score = textPoints + optionalPoints + specificityPoints;

  return { score, label: scoreLabel(score), breakdown };
}

/**
 * Detect client archetype from intake data.
 * Two archetypes: Overwhelmed Poster (posts but nothing works)
 * and Avoider (doesn't post at all).
 */
export function detectArchetype(client: ClientRecord): ArchetypeResult {
  const social = str(client, 'q24_social_active');
  const approach = str(client, 'q21_marketing_approach');
  const stage = str(client, 'q11_current_stage');
  const stageLabel = stage ? (STAGE_LABELS[stage] ?? stage) : null;

  // Overwhelmed Poster: posts but it doesn't work
  if (social && OVERWHELMED_POSTER_SOCIAL.has(social)) {
    if (approach && OVERWHELMED_POSTER_APPROACH.has(approach)) {
      return {
        archetype: 'overwhelmed_poster',
        stage,
        stageLabel,
        confidence: 'clear',
        reasoning: 'Active on social media but marketing efforts aren\'t converting',
      };
    }
    return {
      archetype: 'overwhelmed_poster',
      stage,
      stageLabel,
      confidence: 'inferred',
      reasoning: 'Active on social media — likely posting but needs focus and strategy',
    };
  }

  // Avoider: rarely or never posts
  if (social && AVOIDER_SOCIAL.has(social)) {
    return {
      archetype: 'avoider',
      stage,
      stageLabel,
      confidence: 'clear',
      reasoning: 'Rarely or never active on social media — needs a minimal viable visibility plan',
    };
  }

  return {
    archetype: 'undetermined',
    stage,
    stageLabel,
    confidence: 'inferred',
    reasoning: 'Social media activity not specified — archetype unclear',
  };
}

/**
 * Detect actionable flags from intake data and scores.
 * Flags surface information for the human decision-maker.
 * They never reject anyone automatically.
 */
export function detectFlags(
  client: ClientRecord,
  serviceFitScore?: number,
  engagementScore?: number,
): Flag[] {
  const flags: Flag[] = [];
  const constraint = str(client, 'q39_biggest_constraint');
  const stage = str(client, 'q11_current_stage');
  const time = str(client, 'q38_time_for_marketing');
  const confidence = num(client, 'q13_marketing_confidence');
  const goal = str(client, 'q12_primary_goal');

  // WATCH: Burnout indicator
  if (
    (constraint && FLAG_BURNOUT_CONSTRAINTS.has(constraint)) ||
    (stage && FLAG_BURNOUT_STAGES.has(stage))
  ) {
    flags.push({
      type: 'WATCH',
      label: 'Burnout risk',
      detail: 'Client may be experiencing burnout — lighter load and careful pacing recommended',
      source: constraint === 'burnout' ? 'q39 (biggest constraint)' : 'q11 (current stage)',
    });
  }

  // WATCH: No implementation time
  if (time && FLAG_NO_TIME_VALUES.has(time)) {
    flags.push({
      type: 'WATCH',
      label: 'No implementation time',
      detail: 'Client reports no time available for marketing — implementation may be limited',
      source: 'q38 (time for marketing)',
    });
  }

  // WATCH: Low confidence
  if (confidence !== null && confidence <= FLAG_LOW_CONFIDENCE_THRESHOLD) {
    flags.push({
      type: 'WATCH',
      label: 'Low confidence',
      detail: `Marketing confidence: ${confidence}/5 — may need extra encouragement and simple wins`,
      source: 'q13 (marketing confidence)',
    });
  }

  // HIGH_OPPORTUNITY: Strong engagement + clear gaps + has time
  const threshold = FLAG_HIGH_OPPORTUNITY_SCORE_THRESHOLD;
  if (
    serviceFitScore !== undefined &&
    engagementScore !== undefined &&
    serviceFitScore >= threshold &&
    engagementScore >= threshold &&
    time && !FLAG_NO_TIME_VALUES.has(time)
  ) {
    flags.push({
      type: 'HIGH_OPPORTUNITY',
      label: 'High opportunity',
      detail: 'Strong service fit, engaged intake responses, and available time — excellent candidate',
      source: 'Combined: service fit + engagement + time',
    });
  }

  // REDIRECT: Marketing may not be the actual bottleneck
  if (goal === 'reduce_workload' && stage === 'overwhelmed') {
    flags.push({
      type: 'REDIRECT',
      label: 'Possible redirect',
      detail: 'Client wants to reduce workload and feels overwhelmed — marketing may not be their primary need right now',
      source: 'q12 (goal) + q11 (stage)',
    });
  }

  return flags;
}

/**
 * Generate key highlights — the 4-6 most decision-relevant bullets
 * pulled directly from intake answers.
 */
export function generateHighlights(client: ClientRecord): string[] {
  const highlights: string[] = [];

  // Business identity
  const serviceType = str(client, 'q05_service_type');
  const city = str(client, 'q04_city_state');
  const years = str(client, 'q06_years_in_business');
  const yearsLabel = years ? (YEARS_LABELS[years] ?? years) : null;

  if (serviceType) {
    const parts = [serviceType];
    if (city) parts.push(`in ${city}`);
    if (yearsLabel) parts.push(`\u2014 ${yearsLabel}`);
    highlights.push(parts.join(' '));
  }

  // Stage
  const stage = str(client, 'q11_current_stage');
  if (stage) {
    highlights.push(`Stage: ${STAGE_LABELS[stage] ?? stage}`);
  }

  // Goal
  const goal = str(client, 'q12_primary_goal');
  if (goal) {
    highlights.push(`Goal: ${GOAL_LABELS[goal] ?? goal}`);
  }

  // Time available
  const time = str(client, 'q38_time_for_marketing');
  if (time) {
    highlights.push(`Available: ${TIME_LABELS[time] ?? time}`);
  }

  // Social media
  const social = str(client, 'q24_social_active');
  if (social) {
    const platforms = parseArray(client['q25_platforms_used']);
    const socialLabel = SOCIAL_LABELS[social] ?? social;
    if (platforms.length > 0) {
      highlights.push(`${socialLabel} (${platforms.join(', ')})`);
    } else {
      highlights.push(socialLabel);
    }
  }

  // Proof assets
  const proofAssets = parseArray(client['q45_proof_assets']);
  const reviewCount = str(client, 'q46_google_reviews');
  if (proofAssets.length > 0 || reviewCount) {
    const parts: string[] = [];
    if (reviewCount && reviewCount !== 'no_profile' && reviewCount !== '0') {
      parts.push(`Google reviews: ${REVIEW_COUNT_LABELS[reviewCount] ?? reviewCount}`);
    }
    if (proofAssets.length > 0) {
      const filtered = proofAssets.filter(a => a !== 'None');
      if (filtered.length > 0) {
        parts.push(filtered.join(', '));
      }
    }
    if (parts.length > 0) {
      highlights.push(`Proof: ${parts.join(' + ')}`);
    }
  }

  return highlights;
}

/**
 * Full assessment — combines all scoring, archetype detection,
 * flag detection, and highlights into one result.
 */
export function assessClient(client: ClientRecord): FitAssessment {
  const serviceFit = calculateServiceFitScore(client);
  const readiness = calculateReadinessScore(client);
  const engagement = calculateEngagementScore(client);
  const archetype = detectArchetype(client);
  const flags = detectFlags(client, serviceFit.score, engagement.score);
  const highlights = generateHighlights(client);

  // Overall rating
  const hasRedirect = flags.some(f => f.type === 'REDIRECT');
  let overallRating: 'green' | 'yellow' | 'red';

  if (serviceFit.score < OVERALL_RATING_RULES.redServiceFitMax || hasRedirect) {
    overallRating = 'red';
  } else if (
    serviceFit.score >= OVERALL_RATING_RULES.greenServiceFitMin &&
    readiness.score >= OVERALL_RATING_RULES.greenReadinessMin &&
    !hasRedirect
  ) {
    overallRating = 'green';
  } else {
    overallRating = 'yellow';
  }

  return {
    serviceFit,
    readiness,
    engagement,
    archetype,
    flags,
    highlights,
    overallRating,
    timestamp: new Date().toISOString(),
  };
}
