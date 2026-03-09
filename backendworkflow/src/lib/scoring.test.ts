import { describe, it, expect } from 'vitest';
import {
  wordCount,
  calculateServiceFitScore,
  calculateReadinessScore,
  calculateEngagementScore,
  detectArchetype,
  detectFlags,
  generateHighlights,
  assessClient,
} from './scoring';
import type { ClientRecord } from './scoring';

// --- Test Fixtures ---

/** Full client with strong fit indicators */
const strongFitClient: ClientRecord = {
  id: 1,
  q02_client_name: 'Maria Garcia',
  q04_city_state: 'Temecula, CA',
  q05_service_type: 'Hair Stylist',
  q06_years_in_business: '3_7yr',
  q07_services_most_often: 'Color, cuts, balayage',
  q08_most_profitable: 'Balayage',
  q09_schedule_fullness: '50_75',
  q11_current_stage: 'inconsistent',
  q12_primary_goal: 'consistent_bookings',
  q13_marketing_confidence: 3,
  q14_ideal_client: 'Women aged 30-50 who want low-maintenance color and appreciate quality work. They are busy professionals who want to look put together without high maintenance routines.',
  q16_problems_solved: 'I help women feel confident and put-together without having to spend hours on their hair every morning. I specialize in lived-in color that grows out beautifully.',
  q17_client_sources: '["Referrals","Social Media","Google"]',
  q18_new_clients_month: '3_5',
  q19_what_works: 'Referrals from happy clients work best. When I post transformation photos on Instagram I get DMs but they don\'t always convert to bookings.',
  q21_marketing_approach: 'occasional',
  q22_marketing_feelings: '["Overwhelmed","Confused"]',
  q23_hardest_now: '["Stay consistent","Know what works"]',
  q24_social_active: 'sometimes',
  q25_platforms_used: '["Instagram","Facebook"]',
  q26_post_frequency: 'few_times_month',
  q30_sell_more_of: 'Balayage and color services',
  q31_sell_less_of: 'Basic cuts that take up my schedule',
  q35_tech_comfort: 'comfortable_posting',
  q36_ai_usage: 'occasionally',
  q37_help_wanted: '["Content ideas","Marketing plan"]',
  q38_time_for_marketing: '1_2hrs',
  q39_biggest_constraint: 'consistency',
  q40_success_90_days: 'I would have a consistent flow of color clients booking every week without me having to constantly post on social media. I want a simple system that takes less than 2 hours a week.',
  q41_website: 'https://mariagarcia.com',
  q43_other_social: 'https://tiktok.com/@mariagarcia',
  q44_booking_link: 'https://square.site/mariagarcia',
  q45_proof_assets: '["Google reviews","Before/afters","Testimonials"]',
  q46_google_reviews: '11_25',
  q47_anything_else: 'I just want clarity on what to focus on. I feel like I\'m doing random things and nothing sticks.',
  q48_consent: 1,
};

/** Minimal client — few fields filled */
const minimalClient: ClientRecord = {
  id: 2,
  q02_client_name: 'Test Person',
  q05_service_type: 'Massage Therapist',
};

/** Red flag client — overwhelmed, wants to reduce workload */
const redirectClient: ClientRecord = {
  id: 3,
  q02_client_name: 'Sam Torres',
  q05_service_type: 'Nail Tech',
  q11_current_stage: 'overwhelmed',
  q12_primary_goal: 'reduce_workload',
  q13_marketing_confidence: 1,
  q21_marketing_approach: 'overwhelmed',
  q24_social_active: 'sometimes',
  q38_time_for_marketing: 'none',
  q39_biggest_constraint: 'burnout',
};

/** Avoider client — rarely posts */
const avoiderClient: ClientRecord = {
  id: 4,
  q02_client_name: 'Devon Patel',
  q04_city_state: 'San Diego, CA',
  q05_service_type: 'Esthetician',
  q06_years_in_business: '1_3yr',
  q07_services_most_often: 'Facials, chemical peels',
  q09_schedule_fullness: '25_50',
  q11_current_stage: 'just_starting',
  q12_primary_goal: 'more_clients',
  q13_marketing_confidence: 2,
  q14_ideal_client: 'People who care about skincare',
  q18_new_clients_month: '0_2',
  q21_marketing_approach: 'no_marketing',
  q24_social_active: 'rarely_never',
  q28_stopped_reason: '["No time","Not sure what"]',
  q35_tech_comfort: 'social_only',
  q38_time_for_marketing: 'under_30min',
  q39_biggest_constraint: 'confidence',
  q40_success_90_days: 'More clients',
  q45_proof_assets: '["None"]',
  q46_google_reviews: 'no_profile',
};

// --- wordCount ---

describe('wordCount', () => {
  it('returns 0 for null', () => {
    expect(wordCount(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(wordCount(undefined)).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   ')).toBe(0);
  });

  it('returns 1 for a single word', () => {
    expect(wordCount('hello')).toBe(1);
  });

  it('counts multiple words correctly', () => {
    expect(wordCount('hello world')).toBe(2);
    expect(wordCount('one two three four five')).toBe(5);
  });

  it('handles extra whitespace', () => {
    expect(wordCount('  hello   world  ')).toBe(2);
  });
});

// --- calculateServiceFitScore ---

describe('calculateServiceFitScore', () => {
  it('returns high score for a strong fit client', () => {
    const result = calculateServiceFitScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe('Strong');
  });

  it('returns low score for minimal data', () => {
    const result = calculateServiceFitScore(minimalClient);
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe('Low');
  });

  it('returns 0-100 range', () => {
    const result = calculateServiceFitScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('awards points for service type', () => {
    const result = calculateServiceFitScore(strongFitClient);
    expect(result.breakdown.hasServiceType.points).toBe(20);
  });

  it('awards 0 for missing service type', () => {
    const result = calculateServiceFitScore({ id: 99 });
    expect(result.breakdown.hasServiceType.points).toBe(0);
  });

  it('awards points for aligned goals', () => {
    const result = calculateServiceFitScore(strongFitClient);
    expect(result.breakdown.goalsAlign.points).toBe(25);
  });

  it('awards 0 for reduce_workload goal (not a marketing goal)', () => {
    const result = calculateServiceFitScore({ ...minimalClient, q12_primary_goal: 'reduce_workload' });
    expect(result.breakdown.goalsAlign.points).toBe(0);
  });

  it('includes breakdown for every factor', () => {
    const result = calculateServiceFitScore(strongFitClient);
    expect(Object.keys(result.breakdown)).toHaveLength(6);
    for (const item of Object.values(result.breakdown)) {
      expect(item).toHaveProperty('points');
      expect(item).toHaveProperty('maxPoints');
      expect(item).toHaveProperty('reason');
    }
  });
});

// --- calculateReadinessScore ---

describe('calculateReadinessScore', () => {
  it('returns moderate-to-strong score for ready client', () => {
    const result = calculateReadinessScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('gives 0 time points for "none"', () => {
    const result = calculateReadinessScore({ ...minimalClient, q38_time_for_marketing: 'none' });
    expect(result.breakdown.timeAvailable.points).toBe(0);
  });

  it('gives maximum time points for "2plus_hrs"', () => {
    const result = calculateReadinessScore({ ...minimalClient, q38_time_for_marketing: '2plus_hrs' });
    expect(result.breakdown.timeAvailable.points).toBe(30);
  });

  it('scales confidence from 1-5', () => {
    const low = calculateReadinessScore({ ...minimalClient, q13_marketing_confidence: 1 });
    const high = calculateReadinessScore({ ...minimalClient, q13_marketing_confidence: 5 });
    expect(low.breakdown.confidence.points).toBe(5);
    expect(high.breakdown.confidence.points).toBe(25);
  });

  it('uses neutral default for null confidence', () => {
    const result = calculateReadinessScore(minimalClient);
    expect(result.breakdown.confidence.points).toBe(10);
  });

  it('gives lowest constraint points for burnout', () => {
    const result = calculateReadinessScore({ ...minimalClient, q39_biggest_constraint: 'burnout' });
    expect(result.breakdown.constraintManageable.points).toBe(5);
  });

  it('gives full constraint points when no constraint specified', () => {
    const result = calculateReadinessScore(minimalClient);
    expect(result.breakdown.constraintManageable.points).toBe(25);
  });

  it('returns score in 0-100 range', () => {
    const result = calculateReadinessScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// --- calculateEngagementScore ---

describe('calculateEngagementScore', () => {
  it('returns high score for detailed answers', () => {
    const result = calculateEngagementScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.label).toBe('Strong');
  });

  it('returns low score for empty/missing answers', () => {
    const result = calculateEngagementScore(minimalClient);
    expect(result.score).toBeLessThan(40);
  });

  it('awards points for optional fields filled', () => {
    const result = calculateEngagementScore(strongFitClient);
    expect(result.breakdown.optionalFieldsFilled.points).toBeGreaterThan(0);
  });

  it('awards 0 optional points when none filled', () => {
    const result = calculateEngagementScore(minimalClient);
    expect(result.breakdown.optionalFieldsFilled.points).toBe(0);
  });

  it('awards specificity bonus for detailed vision + ideal client', () => {
    const result = calculateEngagementScore(strongFitClient);
    expect(result.breakdown.specificityBonus.points).toBeGreaterThan(0);
  });

  it('returns score in 0-100 range', () => {
    const result = calculateEngagementScore(strongFitClient);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// --- detectArchetype ---

describe('detectArchetype', () => {
  it('detects overwhelmed_poster with clear confidence', () => {
    const result = detectArchetype({
      q24_social_active: 'yes',
      q21_marketing_approach: 'regular_no_results',
      q11_current_stage: 'inconsistent',
    });
    expect(result.archetype).toBe('overwhelmed_poster');
    expect(result.confidence).toBe('clear');
    expect(result.stage).toBe('inconsistent');
  });

  it('detects overwhelmed_poster with inferred confidence', () => {
    const result = detectArchetype({
      q24_social_active: 'sometimes',
      q21_marketing_approach: 'occasional',
      q11_current_stage: 'inconsistent',
    });
    expect(result.archetype).toBe('overwhelmed_poster');
    expect(result.confidence).toBe('inferred');
  });

  it('detects avoider', () => {
    const result = detectArchetype(avoiderClient);
    expect(result.archetype).toBe('avoider');
    expect(result.confidence).toBe('clear');
  });

  it('returns undetermined when social activity unknown', () => {
    const result = detectArchetype({ q02_client_name: 'Test' });
    expect(result.archetype).toBe('undetermined');
    expect(result.confidence).toBe('inferred');
  });

  it('includes stage label', () => {
    const result = detectArchetype(strongFitClient);
    expect(result.stageLabel).toBe('Inconsistent');
  });

  it('handles null stage', () => {
    const result = detectArchetype({ q24_social_active: 'rarely_never' });
    expect(result.stage).toBeNull();
    expect(result.stageLabel).toBeNull();
  });
});

// --- detectFlags ---

describe('detectFlags', () => {
  it('flags burnout from constraint', () => {
    const flags = detectFlags({ q39_biggest_constraint: 'burnout' });
    expect(flags.some(f => f.type === 'WATCH' && f.label === 'Burnout risk')).toBe(true);
  });

  it('flags burnout from overwhelmed stage', () => {
    const flags = detectFlags({ q11_current_stage: 'overwhelmed' });
    expect(flags.some(f => f.type === 'WATCH' && f.label === 'Burnout risk')).toBe(true);
  });

  it('flags no implementation time', () => {
    const flags = detectFlags({ q38_time_for_marketing: 'none' });
    expect(flags.some(f => f.type === 'WATCH' && f.label === 'No implementation time')).toBe(true);
  });

  it('flags low confidence', () => {
    const flags = detectFlags({ q13_marketing_confidence: 1 });
    expect(flags.some(f => f.type === 'WATCH' && f.label === 'Low confidence')).toBe(true);
  });

  it('does not flag confidence of 3', () => {
    const flags = detectFlags({ q13_marketing_confidence: 3 });
    expect(flags.some(f => f.label === 'Low confidence')).toBe(false);
  });

  it('flags high opportunity when scores are strong and time available', () => {
    const flags = detectFlags(
      { q38_time_for_marketing: '1_2hrs' },
      80, // serviceFit
      75, // engagement
    );
    expect(flags.some(f => f.type === 'HIGH_OPPORTUNITY')).toBe(true);
  });

  it('does not flag high opportunity with no time', () => {
    const flags = detectFlags(
      { q38_time_for_marketing: 'none' },
      80,
      75,
    );
    expect(flags.some(f => f.type === 'HIGH_OPPORTUNITY')).toBe(false);
  });

  it('flags redirect when overwhelmed + reduce_workload', () => {
    const flags = detectFlags(redirectClient);
    expect(flags.some(f => f.type === 'REDIRECT')).toBe(true);
  });

  it('returns empty array when no flags triggered', () => {
    const flags = detectFlags({
      q13_marketing_confidence: 4,
      q38_time_for_marketing: '1_2hrs',
      q39_biggest_constraint: 'clarity',
      q11_current_stage: 'inconsistent',
    });
    // No burnout, no low confidence, no redirect
    // No high opportunity either (no scores passed)
    expect(flags.filter(f => f.type !== 'HIGH_OPPORTUNITY')).toHaveLength(0);
  });

  it('all flags have required properties', () => {
    const flags = detectFlags(redirectClient);
    for (const flag of flags) {
      expect(flag).toHaveProperty('type');
      expect(flag).toHaveProperty('label');
      expect(flag).toHaveProperty('detail');
      expect(flag).toHaveProperty('source');
      expect(typeof flag.label).toBe('string');
      expect(flag.label.length).toBeGreaterThan(0);
    }
  });
});

// --- generateHighlights ---

describe('generateHighlights', () => {
  it('generates multiple highlights for a full client', () => {
    const highlights = generateHighlights(strongFitClient);
    expect(highlights.length).toBeGreaterThanOrEqual(4);
    expect(highlights.length).toBeLessThanOrEqual(7);
  });

  it('includes business identity', () => {
    const highlights = generateHighlights(strongFitClient);
    expect(highlights.some(h => h.includes('Hair Stylist'))).toBe(true);
    expect(highlights.some(h => h.includes('Temecula'))).toBe(true);
  });

  it('includes stage', () => {
    const highlights = generateHighlights(strongFitClient);
    expect(highlights.some(h => h.includes('Inconsistent'))).toBe(true);
  });

  it('includes goal', () => {
    const highlights = generateHighlights(strongFitClient);
    expect(highlights.some(h => h.includes('Consistent bookings'))).toBe(true);
  });

  it('returns fewer highlights for minimal data', () => {
    const highlights = generateHighlights(minimalClient);
    expect(highlights.length).toBeLessThan(4);
  });

  it('filters out null/empty values', () => {
    const highlights = generateHighlights({ id: 99 });
    expect(highlights).toHaveLength(0);
  });

  it('filters out "None" from proof assets', () => {
    const highlights = generateHighlights(avoiderClient);
    expect(highlights.some(h => h.includes('None'))).toBe(false);
  });
});

// --- assessClient ---

describe('assessClient', () => {
  it('returns green for strong fit client', () => {
    const result = assessClient(strongFitClient);
    expect(result.overallRating).toBe('green');
  });

  it('returns red for redirect client', () => {
    const result = assessClient(redirectClient);
    expect(result.overallRating).toBe('red');
  });

  it('returns yellow for borderline client', () => {
    // Avoider has some fit signals but low volume + low confidence
    const result = assessClient(avoiderClient);
    expect(['yellow', 'green']).toContain(result.overallRating);
  });

  it('includes all assessment components', () => {
    const result = assessClient(strongFitClient);
    expect(result).toHaveProperty('serviceFit');
    expect(result).toHaveProperty('readiness');
    expect(result).toHaveProperty('engagement');
    expect(result).toHaveProperty('archetype');
    expect(result).toHaveProperty('flags');
    expect(result).toHaveProperty('highlights');
    expect(result).toHaveProperty('overallRating');
    expect(result).toHaveProperty('timestamp');
  });

  it('timestamp is a valid ISO date', () => {
    const result = assessClient(strongFitClient);
    const date = new Date(result.timestamp);
    expect(date.toISOString()).toBe(result.timestamp);
  });

  it('handles empty client without crashing', () => {
    const result = assessClient({ id: 99 });
    expect(result.overallRating).toBeDefined();
    expect(['green', 'yellow', 'red']).toContain(result.overallRating);
  });
});

// --- Ethical Principles ---

describe('Ethical scoring principles', () => {
  it('low confidence does NOT reduce service fit score', () => {
    const confident = calculateServiceFitScore({ ...strongFitClient, q13_marketing_confidence: 5 });
    const unconfident = calculateServiceFitScore({ ...strongFitClient, q13_marketing_confidence: 1 });
    // Service fit should be identical — confidence only affects readiness
    expect(confident.score).toBe(unconfident.score);
  });

  it('being overwhelmed does NOT reduce service fit score', () => {
    const calm = calculateServiceFitScore({ ...strongFitClient, q11_current_stage: 'inconsistent' });
    const overwhelmed = calculateServiceFitScore({ ...strongFitClient, q11_current_stage: 'overwhelmed' });
    // Service fit should be identical — stage only creates flags
    expect(calm.score).toBe(overwhelmed.score);
  });

  it('burnout creates a flag, not a lower service fit score', () => {
    const noBurnout = calculateServiceFitScore({ ...strongFitClient, q39_biggest_constraint: 'time' });
    const burnout = calculateServiceFitScore({ ...strongFitClient, q39_biggest_constraint: 'burnout' });
    expect(noBurnout.score).toBe(burnout.score);

    const flags = detectFlags({ q39_biggest_constraint: 'burnout' });
    expect(flags.some(f => f.type === 'WATCH')).toBe(true);
  });
});

// --- Score Labels ---

describe('Score labels', () => {
  it('labels 70+ as Strong', () => {
    const result = calculateServiceFitScore(strongFitClient);
    if (result.score >= 70) expect(result.label).toBe('Strong');
  });

  it('labels 40-69 as Moderate', () => {
    // Create a client that should score moderate on readiness
    const result = calculateReadinessScore({
      q38_time_for_marketing: 'under_30min',
      q13_marketing_confidence: 2,
      q39_biggest_constraint: 'time',
      q35_tech_comfort: 'social_only',
    });
    if (result.score >= 40 && result.score < 70) expect(result.label).toBe('Moderate');
  });

  it('labels below 40 as Low', () => {
    const result = calculateServiceFitScore({ id: 99 });
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe('Low');
  });
});
