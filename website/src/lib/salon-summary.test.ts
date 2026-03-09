import { describe, it, expect } from 'vitest';
import {
  parseSalonIntakeNote,
  calculateReadinessScore,
  calculateComplexityScore,
  calculateEngagementScore,
  detectFlags,
  generateHighlights,
  assessSalonIntake,
  type ParsedSalonIntake,
} from './salon-summary';

// ─── Test Fixtures ──────────────────────────────────────────

/** A fully complete intake note. */
const FULL_INTAKE_NOTE = [
  '--- NEW CLIENT INTAKE FORM ---',
  'Submitted: March 5, 2026',
  '',
  '--- ABOUT ---',
  'Name: Jane Doe',
  'Pronouns: She/Her',
  'Email: jane@example.com',
  'Phone: 555-123-4567',
  'Preferred Contact: Email',
  '',
  '--- HAIR PROFILE ---',
  'Service Interest: Cut And Color',
  'Love/Hate: I love my natural wave but hate the frizz when it rains',
  'Texture: Wavy',
  'Length: Medium',
  'Density: Medium',
  'Condition: Color Treated, Frizzy',
  '',
  '--- PERSONALITY & ROUTINE ---',
  'Self-Description: Simple Styler',
  'Daily Routine: Quick Style',
  'Shampoo Frequency: 2 3x Week',
  '',
  '--- HAIR HISTORY (LAST 2 YEARS) ---',
  'Treatments: Salon Color, Highlights Foils',
  'Color Reaction: No',
  'Current Products: Olaplex shampoo and conditioner, Moroccan oil',
  '',
  '--- GOALS & SCHEDULE ---',
  'What They Want: I want to go a bit lighter for summer with some balayage highlights. I would also love to get about two inches trimmed off to keep it healthy and bouncy.',
  'Maintenance Frequency: Every 8 12 Weeks',
  'Availability: Tue Morning, Wed Afternoon, Thu Morning',
  '',
  '--- ADDITIONAL ---',
  'Medical/Allergy Info: None provided',
  'Referral Source: Instagram',
].join('\n');

/** A minimal intake note (sparse data). */
const MINIMAL_INTAKE_NOTE = [
  '--- NEW CLIENT INTAKE FORM ---',
  'Submitted: March 5, 2026',
  '',
  '--- ABOUT ---',
  'Name: Bob Smith',
  'Email: bob@test.com',
  'Phone: 555-000-1111',
  'Preferred Contact: Text',
  '',
  '--- HAIR PROFILE ---',
  'Service Interest: Not Sure',
  'Texture: Straight',
  'Length: Short',
  'Density: Fine Thin',
  'Condition: Healthy',
  '',
  '--- PERSONALITY & ROUTINE ---',
  'Self-Description: Low Maintenance',
  'Daily Routine: Wash And Go',
  'Shampoo Frequency: Daily',
  '',
  '--- HAIR HISTORY (LAST 2 YEARS) ---',
  'Treatments: Nothing',
  'Color Reaction: Not Sure',
  '',
  '--- GOALS & SCHEDULE ---',
  'What They Want: Just a trim',
  'Maintenance Frequency: As Needed',
  'Availability: Flexible',
  '',
  '--- ADDITIONAL ---',
  'Medical/Allergy Info: None provided',
  'Referral Source: Not specified',
].join('\n');

/** A complex client with color correction signals. */
const COMPLEX_INTAKE_NOTE = [
  '--- NEW CLIENT INTAKE FORM ---',
  'Submitted: March 5, 2026',
  '',
  '--- ABOUT ---',
  'Name: Alex Rivera',
  'Pronouns: They/Them',
  'Email: alex@example.com',
  'Phone: 555-999-8888',
  'Preferred Contact: Either',
  '',
  '--- HAIR PROFILE ---',
  'Service Interest: Color',
  'Love/Hate: I hate that my hair feels like straw after bleaching',
  'Texture: Curly',
  'Length: Long',
  'Density: Thick Coarse',
  'Condition: Damaged, Color Treated, Heat Damaged, Split Ends',
  '',
  '--- PERSONALITY & ROUTINE ---',
  'Self-Description: Wants Change Nervous',
  'Daily Routine: Blow Dry Heat',
  'Shampoo Frequency: 2 3x Week',
  '',
  '--- HAIR HISTORY (LAST 2 YEARS) ---',
  'Treatments: Box Dye, Bleach Lightener, Highlights Foils',
  'Color Reaction: Yes',
  'Current Products: Whatever is on sale honestly',
  '',
  '--- GOALS & SCHEDULE ---',
  'What They Want: I want to go from my current dark box-dyed brown back to a lighter ash blonde. I know this is a drastic change and might take multiple sessions. I am willing to be patient and do whatever is healthiest for my hair.',
  'Maintenance Frequency: Every 4 6 Weeks',
  'Availability: Wed Afternoon',
  '',
  '--- ADDITIONAL ---',
  'Medical/Allergy Info: Allergic to PPD found in some hair dyes. Had a reaction at a salon 3 years ago.',
  'Referral Source: Friend recommendation',
].join('\n');

// ─── Helper ─────────────────────────────────────────────────

function parseFull(): ParsedSalonIntake { return parseSalonIntakeNote(FULL_INTAKE_NOTE); }
function parseMinimal(): ParsedSalonIntake { return parseSalonIntakeNote(MINIMAL_INTAKE_NOTE); }
function parseComplex(): ParsedSalonIntake { return parseSalonIntakeNote(COMPLEX_INTAKE_NOTE); }

// ─── Parser Tests ───────────────────────────────────────────

describe('parseSalonIntakeNote', () => {
  it('parses name, email, phone from full intake', () => {
    const p = parseFull();
    expect(p.name).toBe('Jane Doe');
    expect(p.email).toBe('jane@example.com');
    expect(p.phone).toBe('555-123-4567');
  });

  it('parses pronouns', () => {
    expect(parseFull().pronouns).toBe('She/Her');
    expect(parseMinimal().pronouns).toBeNull();
  });

  it('parses service interest', () => {
    expect(parseFull().serviceInterest).toBe('Cut And Color');
    expect(parseMinimal().serviceInterest).toBe('Not Sure');
  });

  it('parses hair profile fields', () => {
    const p = parseFull();
    expect(p.hairTexture).toBe('Wavy');
    expect(p.hairLength).toBe('Medium');
    expect(p.hairDensity).toBe('Medium');
  });

  it('parses hair condition as array', () => {
    expect(parseFull().hairCondition).toEqual(['Color Treated', 'Frizzy']);
    expect(parseComplex().hairCondition).toEqual(['Damaged', 'Color Treated', 'Heat Damaged', 'Split Ends']);
  });

  it('parses hair history treatments as array', () => {
    expect(parseFull().hairHistory).toEqual(['Salon Color', 'Highlights Foils']);
    expect(parseComplex().hairHistory).toEqual(['Box Dye', 'Bleach Lightener', 'Highlights Foils']);
  });

  it('parses optional fields as null when missing', () => {
    const p = parseMinimal();
    expect(p.hairLoveHate).toBeNull();
    expect(p.currentProducts).toBeNull();
    expect(p.pronouns).toBeNull();
  });

  it('parses what they want', () => {
    expect(parseFull().whatTheyWant).toContain('balayage highlights');
    expect(parseMinimal().whatTheyWant).toBe('Just a trim');
  });

  it('parses availability as array', () => {
    expect(parseFull().availability).toEqual(['Tue Morning', 'Wed Afternoon', 'Thu Morning']);
    expect(parseMinimal().availability).toEqual(['Flexible']);
  });

  it('parses medical info', () => {
    expect(parseFull().medicalInfo).toBe('None provided');
    expect(parseComplex().medicalInfo).toContain('Allergic to PPD');
  });

  it('handles empty string input', () => {
    const p = parseSalonIntakeNote('');
    expect(p.name).toBeNull();
    expect(p.hairCondition).toEqual([]);
    expect(p.hairHistory).toEqual([]);
  });
});

// ─── Readiness Score Tests ──────────────────────────────────

describe('calculateReadinessScore', () => {
  it('gives high score for complete intake', () => {
    const score = calculateReadinessScore(parseFull());
    expect(score.score).toBeGreaterThanOrEqual(80);
    expect(score.label).toBe('Strong');
  });

  it('gives moderate score for minimal intake', () => {
    const score = calculateReadinessScore(parseMinimal());
    // Has contact + service + profile + availability but very short goals
    expect(score.score).toBeGreaterThan(40);
    expect(score.score).toBeLessThan(90);
  });

  it('gives zero for empty intake', () => {
    const score = calculateReadinessScore(parseSalonIntakeNote(''));
    expect(score.score).toBe(0);
    expect(score.label).toBe('Low');
  });

  it('gives partial points for incomplete hair profile', () => {
    const intake = parseSalonIntakeNote('Texture: Wavy\nLength: Medium');
    const score = calculateReadinessScore(intake);
    const profileBreakdown = score.breakdowns.find(b => b.label === 'Hair profile complete');
    expect(profileBreakdown!.points).toBeGreaterThan(0);
    expect(profileBreakdown!.points).toBeLessThan(profileBreakdown!.maxPoints);
  });

  it('awards full goal points for detailed description', () => {
    const score = calculateReadinessScore(parseFull());
    const goalBreakdown = score.breakdowns.find(b => b.label === 'Goals described');
    expect(goalBreakdown!.points).toBe(goalBreakdown!.maxPoints);
  });

  it('has 6 breakdowns', () => {
    const score = calculateReadinessScore(parseFull());
    expect(score.breakdowns).toHaveLength(6);
  });
});

// ─── Complexity Score Tests ─────────────────────────────────

describe('calculateComplexityScore', () => {
  it('gives high complexity for client with color correction + damage', () => {
    const score = calculateComplexityScore(parseComplex());
    expect(score.score).toBeGreaterThanOrEqual(60);
    expect(score.label).toBe('High');
  });

  it('gives low complexity for simple client', () => {
    const score = calculateComplexityScore(parseMinimal());
    expect(score.score).toBe(0);
    expect(score.label).toBe('Low');
  });

  it('detects color correction signals', () => {
    const score = calculateComplexityScore(parseComplex());
    const colorBreakdown = score.breakdowns.find(b => b.label === 'Color correction history');
    expect(colorBreakdown!.points).toBe(25);
  });

  it('detects chemical history', () => {
    const intake = parseSalonIntakeNote('Treatments: Keratin, Perm');
    const score = calculateComplexityScore(intake);
    const chemBreakdown = score.breakdowns.find(b => b.label === 'Chemical treatment history');
    expect(chemBreakdown!.points).toBe(20);
  });

  it('detects color reaction', () => {
    const score = calculateComplexityScore(parseComplex());
    const reactionBreakdown = score.breakdowns.find(b => b.label === 'Prior color reaction');
    expect(reactionBreakdown!.points).toBe(15);
  });

  it('has 5 breakdowns', () => {
    const score = calculateComplexityScore(parseFull());
    expect(score.breakdowns).toHaveLength(5);
  });
});

// ─── Engagement Score Tests ─────────────────────────────────

describe('calculateEngagementScore', () => {
  it('gives high engagement for detailed intake', () => {
    const score = calculateEngagementScore(parseFull());
    expect(score.score).toBeGreaterThanOrEqual(60);
    expect(score.label).toBe('Strong');
  });

  it('gives low engagement for sparse intake', () => {
    const score = calculateEngagementScore(parseMinimal());
    expect(score.score).toBeLessThan(35);
    expect(score.label).toBe('Low');
  });

  it('adds photo points when photos present', () => {
    const withPhotos = calculateEngagementScore(parseFull(), true);
    const withoutPhotos = calculateEngagementScore(parseFull(), false);
    expect(withPhotos.score).toBe(withoutPhotos.score + 10);
  });

  it('scores hair love/hate field', () => {
    const score = calculateEngagementScore(parseFull());
    const loveHate = score.breakdowns.find(b => b.label === 'Hair love/hate shared');
    expect(loveHate!.points).toBe(20);
  });

  it('scores products described', () => {
    const score = calculateEngagementScore(parseFull());
    const products = score.breakdowns.find(b => b.label === 'Products described');
    expect(products!.points).toBe(15);
  });

  it('has 5 breakdowns', () => {
    const score = calculateEngagementScore(parseFull());
    expect(score.breakdowns).toHaveLength(5);
  });
});

// ─── Flag Detection Tests ───────────────────────────────────

describe('detectFlags', () => {
  it('detects color correction flag', () => {
    const flags = detectFlags(parseComplex());
    expect(flags.some(f => f.label.includes('Color correction'))).toBe(true);
  });

  it('detects allergy flag from color reaction', () => {
    const flags = detectFlags(parseComplex());
    expect(flags.some(f => f.label.includes('patch test'))).toBe(true);
  });

  it('detects allergy flag from medical info', () => {
    const flags = detectFlags(parseComplex());
    expect(flags.some(f => f.label.includes('Allergy/sensitivity'))).toBe(true);
  });

  it('detects major change flag', () => {
    const flags = detectFlags(parseComplex());
    expect(flags.some(f => f.label.includes('Major change'))).toBe(true);
  });

  it('detects limited availability', () => {
    const flags = detectFlags(parseComplex());
    expect(flags.some(f => f.type === 'NOTE' && f.label.includes('Limited availability'))).toBe(true);
  });

  it('detects good fit flag for low-maintenance regular client', () => {
    const intake = parseSalonIntakeNote(
      'Self-Description: Low Maintenance\nMaintenance Frequency: Every 4 6 Weeks'
    );
    const flags = detectFlags(intake);
    expect(flags.some(f => f.type === 'GOOD_FIT')).toBe(true);
  });

  it('returns only limited-availability flag for simple client', () => {
    const flags = detectFlags(parseMinimal());
    // "Flexible" is a single availability option → triggers NOTE flag
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe('NOTE');
    expect(flags[0].label).toContain('Limited availability');
  });

  it('detects thyroid medication as hair-relevant medical note', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Takes thyroid medication which sometimes affects hair texture'
    );
    const flags = detectFlags(intake);
    const medFlag = flags.find(f => f.label.includes('thyroid'));
    expect(medFlag).toBeDefined();
    expect(medFlag!.type).toBe('NOTE');
    expect(medFlag!.label).toContain('hair texture');
  });

  it('detects pregnancy in medical info', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Currently pregnant, 6 months'
    );
    const flags = detectFlags(intake);
    expect(flags.some(f => f.label.includes('pregnancy') || f.label.includes('pregnant'))).toBe(true);
  });

  it('detects postpartum shedding concern', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Postpartum hair loss for the past 3 months'
    );
    const flags = detectFlags(intake);
    expect(flags.some(f => f.label.includes('postpartum'))).toBe(true);
  });

  it('detects autoimmune condition', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Lupus diagnosis, on immunosuppressants'
    );
    const flags = detectFlags(intake);
    expect(flags.some(f => f.label.includes('lupus'))).toBe(true);
  });

  it('detects scalp conditions', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Psoriasis on the scalp, flares up sometimes'
    );
    const flags = detectFlags(intake);
    expect(flags.some(f => f.label.includes('scalp') || f.label.includes('psoriasis'))).toBe(true);
  });

  it('detects multiple medical conditions', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Thyroid issues, also have eczema on scalp'
    );
    const flags = detectFlags(intake);
    const medFlags = flags.filter(f => f.label.startsWith('Medical note:'));
    expect(medFlags.length).toBeGreaterThanOrEqual(2);
  });

  it('does not duplicate allergy flag when medical info contains allergy keyword', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Allergy to PPD in hair dye, also have thyroid issues'
    );
    const flags = detectFlags(intake);
    // Should have: 1 HEADS_UP for allergy, 1 NOTE for thyroid — not a duplicate allergy note
    const allergyFlags = flags.filter(f => f.label.includes('Allergy/sensitivity'));
    expect(allergyFlags).toHaveLength(1);
    expect(flags.some(f => f.label.includes('thyroid'))).toBe(true);
  });

  it('does not flag "None provided" medical info', () => {
    const intake = parseSalonIntakeNote('Medical/Allergy Info: None provided');
    const flags = detectFlags(intake);
    expect(flags.filter(f => f.label.startsWith('Medical note:')).length).toBe(0);
  });
});

// ─── Highlights Tests ───────────────────────────────────────

describe('generateHighlights', () => {
  it('includes service interest', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.includes('Cut & Color'))).toBe(true);
  });

  it('includes hair type summary', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.includes('Wavy'))).toBe(true);
  });

  it('includes conditions', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.includes('Color Treated'))).toBe(true);
  });

  it('includes goal', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.startsWith('Goal:'))).toBe(true);
  });

  it('includes maintenance frequency', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.includes('Maintenance:'))).toBe(true);
  });

  it('includes referral source when provided', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.includes('Instagram'))).toBe(true);
  });

  it('omits referral when not specified', () => {
    const highlights = generateHighlights(parseMinimal());
    expect(highlights.some(h => h.includes('Referred by'))).toBe(false);
  });

  it('includes medical info when present', () => {
    const intake = parseSalonIntakeNote(
      'Medical/Allergy Info: Thyroid medication which sometimes affects hair texture'
    );
    const highlights = generateHighlights(intake);
    expect(highlights.some(h => h.startsWith('Medical note:') && h.includes('Thyroid'))).toBe(true);
  });

  it('omits medical info when None provided', () => {
    const highlights = generateHighlights(parseFull());
    expect(highlights.some(h => h.startsWith('Medical note:'))).toBe(false);
  });

  it('returns empty for empty intake', () => {
    const highlights = generateHighlights(parseSalonIntakeNote(''));
    expect(highlights).toHaveLength(0);
  });
});

// ─── Full Assessment Tests ──────────────────────────────────

describe('assessSalonIntake', () => {
  it('returns green for complete, straightforward client', () => {
    const summary = assessSalonIntake(parseFull());
    expect(summary.overallRating).toBe('green');
  });

  it('returns yellow for complex client with color correction', () => {
    const summary = assessSalonIntake(parseComplex());
    // Complex has high readiness but color correction flag → yellow
    expect(summary.overallRating).toBe('yellow');
  });

  it('returns red for very sparse intake', () => {
    const summary = assessSalonIntake(parseSalonIntakeNote(''));
    expect(summary.overallRating).toBe('red');
  });

  it('includes all three scores', () => {
    const summary = assessSalonIntake(parseFull());
    expect(summary.readiness.score).toBeGreaterThan(0);
    expect(summary.complexity).toBeDefined();
    expect(summary.engagement.score).toBeGreaterThan(0);
  });

  it('includes flags and highlights', () => {
    const summary = assessSalonIntake(parseComplex());
    expect(summary.flags.length).toBeGreaterThan(0);
    expect(summary.highlights.length).toBeGreaterThan(0);
  });

  it('passes hasPhotos through to engagement', () => {
    const withPhotos = assessSalonIntake(parseFull(), true);
    const withoutPhotos = assessSalonIntake(parseFull(), false);
    expect(withPhotos.engagement.score).toBe(withoutPhotos.engagement.score + 10);
  });
});
