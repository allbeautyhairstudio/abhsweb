import { describe, it, expect } from 'vitest';
import {
  quickAddClientSchema,
  fullIntakeSchema,
  createNoteSchema,
  updateDeliverableSchema,
  createRevenueSchema,
  fitAssessmentActionSchema,
} from './validation';

describe('quickAddClientSchema', () => {
  it('accepts valid minimal client data', () => {
    const result = quickAddClientSchema.safeParse({
      q02_client_name: 'Jane Doe',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty client name', () => {
    const result = quickAddClientSchema.safeParse({
      q02_client_name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing client name', () => {
    const result = quickAddClientSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('validates email format when provided', () => {
    const valid = quickAddClientSchema.safeParse({
      q02_client_name: 'Jane',
      q03_email: 'jane@example.com',
    });
    expect(valid.success).toBe(true);

    const invalid = quickAddClientSchema.safeParse({
      q02_client_name: 'Jane',
      q03_email: 'not-an-email',
    });
    expect(invalid.success).toBe(false);
  });

  it('defaults status to inquiry', () => {
    const result = quickAddClientSchema.parse({
      q02_client_name: 'Jane Doe',
    });
    expect(result.status).toBe('inquiry');
  });

  it('accepts valid pipeline status', () => {
    const result = quickAddClientSchema.safeParse({
      q02_client_name: 'Jane',
      status: 'session_scheduled',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid pipeline status', () => {
    const result = quickAddClientSchema.safeParse({
      q02_client_name: 'Jane',
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('enforces max length on client name', () => {
    const result = quickAddClientSchema.safeParse({
      q02_client_name: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('fullIntakeSchema', () => {
  it('accepts complete intake data', () => {
    const result = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane Doe',
      q01_business_name: 'Salon Jane',
      q03_email: 'jane@example.com',
      q04_city_state: 'Temecula, CA',
      q05_service_type: 'Hair',
      q06_years_in_business: '3_7yr',
      q09_schedule_fullness: '50_75',
      q11_current_stage: 'inconsistent',
      q13_marketing_confidence: 3,
      q24_social_active: 'sometimes',
      q36_ai_usage: 'occasionally',
      q48_consent: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid enum values', () => {
    const result = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q06_years_in_business: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('validates marketing confidence range (1-5)', () => {
    const valid = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q13_marketing_confidence: 3,
    });
    expect(valid.success).toBe(true);

    const tooLow = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q13_marketing_confidence: 0,
    });
    expect(tooLow.success).toBe(false);

    const tooHigh = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q13_marketing_confidence: 6,
    });
    expect(tooHigh.success).toBe(false);
  });

  it('validates time tier range (1-4)', () => {
    const valid = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      time_tier: 2,
    });
    expect(valid.success).toBe(true);

    const invalid = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      time_tier: 5,
    });
    expect(invalid.success).toBe(false);
  });

  it('validates consent is 0 or 1', () => {
    expect(fullIntakeSchema.safeParse({ q02_client_name: 'Jane', q48_consent: 1 }).success).toBe(true);
    expect(fullIntakeSchema.safeParse({ q02_client_name: 'Jane', q48_consent: 0 }).success).toBe(true);
    expect(fullIntakeSchema.safeParse({ q02_client_name: 'Jane', q48_consent: 2 }).success).toBe(false);
  });

  it('allows nullable optional fields', () => {
    const result = fullIntakeSchema.safeParse({
      q02_client_name: 'Jane',
      q01_business_name: null,
      q04_city_state: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('createNoteSchema', () => {
  it('accepts valid note', () => {
    const result = createNoteSchema.safeParse({
      client_id: 1,
      content: 'Great initial call. Client seems engaged.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createNoteSchema.safeParse({
      client_id: 1,
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid client_id', () => {
    const result = createNoteSchema.safeParse({
      client_id: -1,
      content: 'Some note',
    });
    expect(result.success).toBe(false);
  });

  it('defaults note_type to general', () => {
    const result = createNoteSchema.parse({
      client_id: 1,
      content: 'A note',
    });
    expect(result.note_type).toBe('general');
  });

  it('accepts valid note types', () => {
    for (const type of ['general', 'session_note', 'follow_up_note', 'analysis_note', 'interest_flag']) {
      const result = createNoteSchema.safeParse({
        client_id: 1,
        content: 'Note',
        note_type: type,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateDeliverableSchema', () => {
  it('accepts valid deliverable update', () => {
    const result = updateDeliverableSchema.safeParse({
      status: 'reviewed',
    });
    expect(result.success).toBe(true);
  });

  it('accepts status with content', () => {
    const result = updateDeliverableSchema.safeParse({
      status: 'generated',
      content: 'Generated deliverable content here...',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateDeliverableSchema.safeParse({
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['not_started', 'generated', 'reviewed', 'sent']) {
      expect(updateDeliverableSchema.safeParse({ status }).success).toBe(true);
    }
  });
});

describe('createRevenueSchema', () => {
  it('accepts valid revenue entry', () => {
    const result = createRevenueSchema.safeParse({
      amount: 250,
      date: '2026-02-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero or negative amount', () => {
    expect(createRevenueSchema.safeParse({ amount: 0, date: '2026-02-15' }).success).toBe(false);
    expect(createRevenueSchema.safeParse({ amount: -50, date: '2026-02-15' }).success).toBe(false);
  });

  it('rejects missing date', () => {
    const result = createRevenueSchema.safeParse({
      amount: 250,
      date: '',
    });
    expect(result.success).toBe(false);
  });

  it('defaults entry_type to session', () => {
    const result = createRevenueSchema.parse({
      amount: 250,
      date: '2026-02-15',
    });
    expect(result.entry_type).toBe('session');
  });
});

describe('fitAssessmentActionSchema', () => {
  it('accepts valid accept action', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'green',
      archetype: 'overwhelmed_poster',
      action: 'accept',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid decline action', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'red',
      archetype: null,
      action: 'decline',
      decline_reason: 'Business is pre-launch, not ready for marketing reset.',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null archetype', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'yellow',
      archetype: null,
      action: 'accept',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid fit_rating', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'purple',
      archetype: 'avoider',
      action: 'accept',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid action', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'green',
      archetype: 'avoider',
      action: 'maybe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid archetype value', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'green',
      archetype: 'unknown_type',
      action: 'accept',
    });
    expect(result.success).toBe(false);
  });

  it('accepts decline without decline_reason', () => {
    const result = fitAssessmentActionSchema.safeParse({
      fit_rating: 'red',
      archetype: null,
      action: 'decline',
    });
    expect(result.success).toBe(true);
  });
});
