import { describe, it, expect } from 'vitest';
import { intakeFormSchema } from './intake-validation';

// ─── Test Fixtures ──────────────────────────────────────────

/** A complete, valid intake form submission. */
function validIntake() {
  return {
    first_name: 'Jane',
    last_name: 'Doe',
    pronouns: 'She/Her',
    email: 'jane@example.com',
    phone: '555-123-4567',
    preferred_contact: ['text'],
    service_interest: ['haircut-style', 'low-maintenance-color'],
    hair_love_hate: 'I love my natural wave',
    hair_texture: 'wavy',
    hair_length: 'medium',
    hair_density: 'medium',
    hair_condition: ['split-ends', 'heat-damage'],
    styling_description: 'low-maintenance',
    daily_routine: 'wash-and-go',
    shampoo_frequency: '2-3x-week',
    hair_history: ['professional-color', 'previous-lightening'],
    color_reaction: ['no-reaction'],
    product_shampoo: 'Olaplex No.4',
    product_conditioner: 'Olaplex No.5',
    what_you_want: 'I want some balayage highlights for summer',
    maintenance_frequency: '6-8-weeks',
    availability: ['tue-morning', 'wed-afternoon'],
    consent: true as const,
  };
}

// ─── Schema Validation ──────────────────────────────────────

describe('intakeFormSchema', () => {
  it('accepts a complete valid submission', () => {
    const result = intakeFormSchema.safeParse(validIntake());
    expect(result.success).toBe(true);
  });

  it('accepts minimal optional fields (only required)', () => {
    const minimal = {
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob@test.com',
      phone: '555-000-1111',
      preferred_contact: ['email'],
      service_interest: ['other-not-sure'],
      hair_texture: 'straight',
      hair_length: 'short',
      hair_density: 'fine',
      hair_condition: ['other'],
      styling_description: 'low-maintenance',
      daily_routine: 'wash-and-go',
      shampoo_frequency: 'daily',
      hair_history: ['never-colored'],
      color_reaction: ['not-sure'],
      what_you_want: 'Just a trim',
      maintenance_frequency: '6-8-weeks',
      availability: ['flexible'],
      consent: true as const,
    };
    const result = intakeFormSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  // ─── Array Fields: service_interest ──────────────────────

  describe('service_interest (array field)', () => {
    it('rejects empty array', () => {
      const data = { ...validIntake(), service_interest: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts single valid value', () => {
      const data = { ...validIntake(), service_interest: ['haircut-style'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts multiple valid values', () => {
      const data = { ...validIntake(), service_interest: ['haircut-style', 'mini-service', 'other-not-sure'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid enum value', () => {
      const data = { ...validIntake(), service_interest: ['bogus-service'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects mix of valid and invalid', () => {
      const data = { ...validIntake(), service_interest: ['haircut-style', 'invalid'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects old string value (not array)', () => {
      const data = { ...validIntake(), service_interest: 'haircut-style' };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Array Fields: preferred_contact ─────────────────────

  describe('preferred_contact (array field)', () => {
    it('rejects empty array', () => {
      const data = { ...validIntake(), preferred_contact: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts single value', () => {
      const data = { ...validIntake(), preferred_contact: ['text'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts multiple values', () => {
      const data = { ...validIntake(), preferred_contact: ['text', 'email'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid value', () => {
      const data = { ...validIntake(), preferred_contact: ['pigeon'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects old string value (not array)', () => {
      const data = { ...validIntake(), preferred_contact: 'text' };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Array Fields: color_reaction ────────────────────────

  describe('color_reaction (array field)', () => {
    it('rejects empty array', () => {
      const data = { ...validIntake(), color_reaction: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts single valid value', () => {
      const data = { ...validIntake(), color_reaction: ['itching'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts multiple reaction values', () => {
      const data = { ...validIntake(), color_reaction: ['itching', 'burning', 'swelling'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid enum value', () => {
      const data = { ...validIntake(), color_reaction: ['exploded'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts no-reaction option', () => {
      const data = { ...validIntake(), color_reaction: ['no-reaction'] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects old string value (not array)', () => {
      const data = { ...validIntake(), color_reaction: 'no-reaction' };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Product Fields ──────────────────────────────────────

  describe('product fields (individual text inputs)', () => {
    it('accepts all product fields with values', () => {
      const data = {
        ...validIntake(),
        product_shampoo: 'Olaplex No.4',
        product_conditioner: 'Olaplex No.5',
        product_hair_spray: 'Kenra 25',
        product_dry_shampoo: 'Batiste',
        product_heat_protector: 'Chi 44 Iron Guard',
        product_other: 'Moroccan oil',
      };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts undefined product fields (all optional)', () => {
      const data = validIntake();
      delete (data as Record<string, unknown>).product_shampoo;
      delete (data as Record<string, unknown>).product_conditioner;
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects product field exceeding 200 chars', () => {
      const data = { ...validIntake(), product_shampoo: 'A'.repeat(201) };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts product field at exactly 200 chars', () => {
      const data = { ...validIntake(), product_shampoo: 'A'.repeat(200) };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  // ─── Old field removal ───────────────────────────────────

  describe('removed fields', () => {
    it('strips old current_products field (not in schema)', () => {
      const data = { ...validIntake(), current_products: 'Olaplex shampoo' };
      const result = intakeFormSchema.safeParse(data);
      // Zod strips unknown keys by default -- should still pass
      expect(result.success).toBe(true);
      if (result.success) {
        expect('current_products' in result.data).toBe(false);
      }
    });
  });

  // ─── Other array fields (hair_condition, hair_history, availability) ─

  describe('other array fields', () => {
    it('rejects empty hair_condition', () => {
      const data = { ...validIntake(), hair_condition: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty hair_history', () => {
      const data = { ...validIntake(), hair_history: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects empty availability', () => {
      const data = { ...validIntake(), availability: [] };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ─── Required field validation ───────────────────────────

  describe('required fields', () => {
    it('rejects missing first_name', () => {
      const data = { ...validIntake(), first_name: '' };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects missing email', () => {
      const data = { ...validIntake(), email: 'not-an-email' };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects missing consent', () => {
      const data = { ...validIntake(), consent: false };
      const result = intakeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
