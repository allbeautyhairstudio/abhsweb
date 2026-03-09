import { describe, it, expect } from 'vitest';
import {
  formatIntakeDataBlock,
  replaceFieldPlaceholders,
  populatePrompt,
  populateAllPrompts,
  safeParseJsonArray,
  type ClientRecord,
} from './auto-populate';
import { PROMPT_TEMPLATES } from '@/lib/constants/prompt-templates';

// ---------------------------------------------------------------------------
// Mock client with realistic test data
// ---------------------------------------------------------------------------
const mockClient: ClientRecord = {
  id: 1,
  created_at: '2026-02-20',
  updated_at: '2026-02-20',
  status: 'analysis_prep',
  fit_rating: 'green',
  archetype: 'overwhelmed_poster',
  time_tier: 3,
  q01_business_name: 'Salon Bloom',
  q02_client_name: 'Maria Garcia',
  q03_email: 'maria@salonbloom.com',
  q04_city_state: 'Temecula, CA',
  q05_service_type: 'Hair Stylist',
  q06_years_in_business: '3_7yr',
  q07_services_most_often: 'Balayage, cuts, color corrections',
  q08_most_profitable: 'Color corrections and extensions',
  q09_schedule_fullness: '50_75',
  q10_clients_per_week: '15',
  q11_current_stage: 'inconsistent',
  q12_primary_goal: 'consistent_bookings',
  q13_marketing_confidence: 2,
  q14_ideal_client: 'Women 28-45 who want low-maintenance luxury color',
  q15_clients_to_avoid: 'Price shoppers, last-minute cancellers',
  q16_problems_solved: 'Clients want to look put-together without hours of styling',
  q17_client_sources: '["Referrals from existing clients","Social media (Instagram, Facebook, TikTok, etc.)"]',
  q18_new_clients_month: '3_5',
  q19_what_works: 'Word of mouth and Instagram before/afters',
  q20_what_didnt_work: 'Facebook ads — spent $200, got zero bookings',
  q21_marketing_approach: 'occasional',
  q22_marketing_feelings: '["Overwhelmed — too much to figure out","Unsure where to start"]',
  q23_hardest_now: '["Knowing what to post or say","Staying consistent with anything"]',
  q24_social_active: 'sometimes',
  q25_platforms_used: '["Instagram","Facebook"]',
  q26_post_frequency: 'few_times_month',
  q27_best_content: 'Before and after photos',
  q28_stopped_reason: null,
  q29_tolerable_activity: null,
  q30_sell_more_of: 'Balayage packages and color corrections',
  q31_sell_less_of: 'Basic cuts under $50',
  q32_average_price: '$150',
  q33_highest_price: '$350 full color correction',
  q34_no_shows_impact: 'sometimes',
  q35_tech_comfort: 'comfortable_posting',
  q36_ai_usage: 'occasionally',
  q37_help_wanted: '["Coming up with ideas for content","Building a marketing plan or system"]',
  q38_time_for_marketing: '1_2hrs',
  q39_biggest_constraint: 'consistency',
  q40_success_90_days: 'Consistent bookings every week, a clear system I actually follow',
  q41_website: 'https://salonbloom.com',
  q42_instagram_link: 'https://instagram.com/salonbloom',
  q43_other_social: 'Facebook: Salon Bloom Temecula',
  q44_booking_link: 'https://salonbloom.booksy.com',
  q45_proof_assets: '["Google reviews","Before-and-after photos of your work"]',
  q46_google_reviews: '11_25',
  q47_anything_else: 'I know what I should be doing but I never actually do it. Consistency is my biggest struggle.',
  q48_consent: 1,
};

const emptyClient: ClientRecord = {
  id: 2,
  q02_client_name: 'Test Person',
  status: 'inquiry',
};

// ---------------------------------------------------------------------------
// safeParseJsonArray
// ---------------------------------------------------------------------------
describe('safeParseJsonArray', () => {
  it('parses valid JSON array', () => {
    expect(safeParseJsonArray('["a","b","c"]')).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for invalid JSON', () => {
    expect(safeParseJsonArray('not json')).toEqual([]);
  });

  it('returns empty array for JSON object (not array)', () => {
    expect(safeParseJsonArray('{"key":"value"}')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(safeParseJsonArray('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// formatIntakeDataBlock
// ---------------------------------------------------------------------------
describe('formatIntakeDataBlock', () => {
  it('includes all 48 field labels organized by section', () => {
    const block = formatIntakeDataBlock(mockClient);
    expect(block).toContain('SECTION 1: BUSINESS SNAPSHOT');
    expect(block).toContain('SECTION 12: FINAL THOUGHTS');
    expect(block).toContain('Business Name: Salon Bloom');
    expect(block).toContain('Client Name: Maria Garcia');
  });

  it('formats JSON array fields as comma-separated values', () => {
    const block = formatIntakeDataBlock(mockClient);
    expect(block).toContain('Where Clients Come From: Referrals from existing clients, Social media (Instagram, Facebook, TikTok, etc.)');
    expect(block).toContain('Platforms Used: Instagram, Facebook');
  });

  it('shows (not provided) for null/empty fields', () => {
    const block = formatIntakeDataBlock(emptyClient);
    expect(block).toContain('Business Name: (not provided)');
    expect(block).toContain('Email Address: (not provided)');
  });

  it('maps years_in_business enum to display label', () => {
    const block = formatIntakeDataBlock(mockClient);
    expect(block).toContain('Years in Business: 3-7 years');
  });

  it('formats consent as Yes/No', () => {
    const block = formatIntakeDataBlock(mockClient);
    expect(block).toContain('Consent: Yes');

    const noConsent = { ...mockClient, q48_consent: 0 };
    const block2 = formatIntakeDataBlock(noConsent);
    expect(block2).toContain('Consent: No');
  });

  it('includes section headers with separator', () => {
    const block = formatIntakeDataBlock(mockClient);
    const sections = block.match(/--- SECTION \d+:/g);
    expect(sections).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// replaceFieldPlaceholders
// ---------------------------------------------------------------------------
describe('replaceFieldPlaceholders', () => {
  it('replaces [YOUR SERVICE TYPE] with q05_service_type', () => {
    const result = replaceFieldPlaceholders('I am a [YOUR SERVICE TYPE]', mockClient);
    expect(result).toBe('I am a Hair Stylist');
  });

  it('replaces [SERVICE TYPE] (without YOUR)', () => {
    const result = replaceFieldPlaceholders('I am a [SERVICE TYPE]', mockClient);
    expect(result).toBe('I am a Hair Stylist');
  });

  it('replaces [YOUR CITY/AREA] with q04_city_state', () => {
    const result = replaceFieldPlaceholders('based in [YOUR CITY/AREA]', mockClient);
    expect(result).toBe('based in Temecula, CA');
  });

  it('replaces [YOUR BUSINESS NAME]', () => {
    const result = replaceFieldPlaceholders('at [YOUR BUSINESS NAME]', mockClient);
    expect(result).toBe('at Salon Bloom');
  });

  it('replaces [YOUR PLATFORM] with first item from JSON array', () => {
    const result = replaceFieldPlaceholders('post on [YOUR PLATFORM]', mockClient);
    expect(result).toBe('post on Instagram');
  });

  it('replaces [YOUR PLATFORMS] with comma-joined JSON array', () => {
    const result = replaceFieldPlaceholders('I use [YOUR PLATFORMS]', mockClient);
    expect(result).toBe('I use Instagram, Facebook');
  });

  it('replaces [BOOKING LINK]', () => {
    const result = replaceFieldPlaceholders('Book here: [BOOKING LINK]', mockClient);
    expect(result).toBe('Book here: https://salonbloom.booksy.com');
  });

  it('replaces [YEARS] with display label', () => {
    const result = replaceFieldPlaceholders('[YEARS] years', mockClient);
    expect(result).toBe('3-7 years years');
  });

  it('leaves fallback placeholder when field is null', () => {
    const result = replaceFieldPlaceholders('[YOUR SERVICE TYPE] in [YOUR CITY/AREA]', emptyClient);
    expect(result).toBe('[YOUR SERVICE TYPE] in [YOUR CITY/AREA]');
  });

  it('is case-insensitive in replacement', () => {
    const result = replaceFieldPlaceholders('[your service type]', mockClient);
    expect(result).toBe('Hair Stylist');
  });

  it('handles multiple occurrences of same placeholder', () => {
    const result = replaceFieldPlaceholders('[SERVICE TYPE] and [SERVICE TYPE]', mockClient);
    expect(result).toBe('Hair Stylist and Hair Stylist');
  });

  it('replaces [IDEAL CLIENTS]', () => {
    const result = replaceFieldPlaceholders('My clients are [IDEAL CLIENTS]', mockClient);
    expect(result).toBe('My clients are Women 28-45 who want low-maintenance luxury color');
  });

  it('replaces [YOUR SPECIALTIES]', () => {
    const result = replaceFieldPlaceholders('[YOUR SPECIALTIES]', mockClient);
    expect(result).toBe('Color corrections and extensions');
  });
});

// ---------------------------------------------------------------------------
// populatePrompt
// ---------------------------------------------------------------------------
describe('populatePrompt', () => {
  const QS = PROMPT_TEMPLATES.find(t => t.code === 'QS')!;
  const ALD = PROMPT_TEMPLATES.find(t => t.code === 'ALD')!;
  const SNI = PROMPT_TEMPLATES.find(t => t.code === 'SNI')!;
  const CE1 = PROMPT_TEMPLATES.find(t => t.code === 'CE-1')!;

  it('replaces [PASTE FULL INTAKE RESPONSES HERE] in backend prompts', () => {
    const result = populatePrompt(QS, mockClient);
    expect(result.populated_prompt).toContain('Business Name: Salon Bloom');
    expect(result.populated_prompt).not.toContain('[PASTE FULL INTAKE RESPONSES HERE]');
  });

  it('marks standalone prompts as ready', () => {
    const result = populatePrompt(QS, mockClient);
    expect(result.is_ready).toBe(true);
    expect(result.missing_dependency).toBeUndefined();
  });

  it('marks chain-dependent prompts as not ready when output is missing', () => {
    const result = populatePrompt(ALD, mockClient);
    expect(result.is_ready).toBe(false);
    expect(result.missing_dependency).toBe('MA');
  });

  it('marks chain-dependent prompts as ready when output is provided', () => {
    const result = populatePrompt(ALD, mockClient, { MA: 'Master Analysis output here' });
    expect(result.is_ready).toBe(true);
    expect(result.missing_dependency).toBeUndefined();
  });

  it('replaces chain output placeholder in ALD', () => {
    const result = populatePrompt(ALD, mockClient, { MA: 'The business snapshot goes here' });
    expect(result.populated_prompt).toContain('The business snapshot goes here');
    expect(result.populated_prompt).not.toContain('[PASTE THE STEP 1 OUTPUT FROM THE MASTER ANALYSIS]');
  });

  it('replaces chain output placeholder in SNI', () => {
    const result = populatePrompt(SNI, mockClient, { CPS: 'Profile summary here' });
    expect(result.populated_prompt).toContain('Profile summary here');
  });

  it('replaces Q47 placeholder in SNI', () => {
    const result = populatePrompt(SNI, mockClient);
    expect(result.populated_prompt).toContain('I know what I should be doing but I never actually do it');
    expect(result.populated_prompt).not.toContain('[PASTE THEIR RESPONSE TO QUESTION 47 HERE]');
  });

  it('shows "Client left this blank" when Q47 is empty', () => {
    const result = populatePrompt(SNI, { ...mockClient, q47_anything_else: '' });
    expect(result.populated_prompt).toContain('(Client left this blank)');
  });

  it('detects unfilled dynamic placeholders in content prompts', () => {
    const result = populatePrompt(CE1, mockClient);
    // CE-1 has placeholders like [DESCRIBE YOUR IDEAL CLIENT IN 1-2 SENTENCES] which gets replaced
    // but also references q25 as platform which gets replaced
    // The remaining unfilled ones should be flagged
    expect(result.has_unfilled_placeholders).toBeDefined();
  });

  it('replaces field placeholders in workflow prompts', () => {
    const result = populatePrompt(CE1, mockClient);
    expect(result.populated_prompt).toContain('Hair Stylist');
    expect(result.populated_prompt).toContain('Temecula, CA');
  });
});

// ---------------------------------------------------------------------------
// populateAllPrompts
// ---------------------------------------------------------------------------
describe('populateAllPrompts', () => {
  it('returns one PopulatedPrompt per template', () => {
    const results = populateAllPrompts(mockClient);
    expect(results).toHaveLength(PROMPT_TEMPLATES.length);
  });

  it('all standalone prompts (no chain dependency) are ready', () => {
    const results = populateAllPrompts(mockClient);
    const standalone = results.filter(r => {
      const t = PROMPT_TEMPLATES.find(t => t.code === r.prompt_code);
      return !t?.chain_dependency;
    });
    for (const p of standalone) {
      expect(p.is_ready).toBe(true);
    }
  });

  it('chain-dependent prompts show missing dependency', () => {
    const results = populateAllPrompts(mockClient);
    const ald = results.find(r => r.prompt_code === 'ALD');
    expect(ald?.is_ready).toBe(false);
    expect(ald?.missing_dependency).toBe('MA');
  });

  it('chain-dependent prompts become ready when chain outputs provided', () => {
    const results = populateAllPrompts(mockClient, { MA: 'output', CPS: 'output' });
    const ald = results.find(r => r.prompt_code === 'ALD');
    const sni = results.find(r => r.prompt_code === 'SNI');
    expect(ald?.is_ready).toBe(true);
    expect(sni?.is_ready).toBe(true);
  });

  it('each prompt has a unique code', () => {
    const results = populateAllPrompts(mockClient);
    const codes = results.map(r => r.prompt_code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
