import { describe, it, expect } from 'vitest';
import {
  searchAvailabilitySchema,
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  searchMultiAvailabilitySchema,
  createMultiBookingSchema,
  acceptBookingSchema,
} from './booking-validation';

describe('searchAvailabilitySchema', () => {
  it('accepts valid input', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: 'SVC_123',
      date: '2026-03-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input with optional teamMemberId', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: 'SVC_123',
      date: '2026-03-15',
      teamMemberId: 'TEAM_456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty serviceVariationId', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: '',
      date: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format (MM/DD/YYYY)', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: 'SVC_123',
      date: '03/15/2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format (no dashes)', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: 'SVC_123',
      date: '20260315',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing date', () => {
    const result = searchAvailabilitySchema.safeParse({
      serviceVariationId: 'SVC_123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing serviceVariationId', () => {
    const result = searchAvailabilitySchema.safeParse({
      date: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });
});

describe('createBookingSchema', () => {
  const validInput = {
    serviceVariationId: 'SVC_123',
    serviceVariationVersion: '1234567890',
    startAt: '2026-03-15T10:00:00Z',
    teamMemberId: 'TEAM_456',
    durationMinutes: 60,
    customer: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-1234',
    },
  };

  it('accepts valid input', () => {
    const result = createBookingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts input with customer note', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, note: 'Please use gentle products' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing customer firstName', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, firstName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing customer lastName', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, lastName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid customer email', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, email: 'not-an-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing customer phone', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, phone: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero durationMinutes', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      durationMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative durationMinutes', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      durationMinutes: -30,
    });
    expect(result.success).toBe(false);
  });

  it('rejects customer note exceeding max length', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, note: 'a'.repeat(2001) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing serviceVariationVersion', () => {
    const { serviceVariationVersion: _, ...noVersion } = validInput;
    const result = createBookingSchema.safeParse(noVersion);
    expect(result.success).toBe(false);
  });

  it('rejects missing startAt', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      startAt: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing teamMemberId', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      teamMemberId: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts customer name with max 100 chars', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: {
        ...validInput.customer,
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects customer firstName over 100 chars', () => {
    const result = createBookingSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, firstName: 'A'.repeat(101) },
    });
    expect(result.success).toBe(false);
  });
});

describe('cancelBookingSchema', () => {
  it('accepts valid input with version only', () => {
    const result = cancelBookingSchema.safeParse({ version: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with reason', () => {
    const result = cancelBookingSchema.safeParse({
      version: 5,
      reason: 'Client requested cancellation',
    });
    expect(result.success).toBe(true);
  });

  it('accepts zero version (Square starts at 0)', () => {
    const result = cancelBookingSchema.safeParse({ version: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects negative version', () => {
    const result = cancelBookingSchema.safeParse({ version: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding max length', () => {
    const result = cancelBookingSchema.safeParse({
      version: 1,
      reason: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('searchMultiAvailabilitySchema', () => {
  it('accepts valid single-segment input', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: [{ serviceVariationId: 'SVC_123' }],
      date: '2026-03-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple segments', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: [
        { serviceVariationId: 'SVC_123' },
        { serviceVariationId: 'SVC_456' },
      ],
      date: '2026-03-15',
      teamMemberId: 'TEAM_789',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty segments array', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: [],
      date: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 segments', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: Array.from({ length: 6 }, (_, i) => ({
        serviceVariationId: `SVC_${i}`,
      })),
      date: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('accepts exactly 5 segments', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: Array.from({ length: 5 }, (_, i) => ({
        serviceVariationId: `SVC_${i}`,
      })),
      date: '2026-03-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects segment with empty serviceVariationId', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: [{ serviceVariationId: '' }],
      date: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = searchMultiAvailabilitySchema.safeParse({
      segments: [{ serviceVariationId: 'SVC_123' }],
      date: '03/15/2026',
    });
    expect(result.success).toBe(false);
  });
});

describe('createMultiBookingSchema', () => {
  const validMultiInput = {
    segments: [
      {
        serviceVariationId: 'SVC_123',
        serviceVariationVersion: '1234567890',
        durationMinutes: 90,
      },
      {
        serviceVariationId: 'SVC_456',
        serviceVariationVersion: '9876543210',
        durationMinutes: 60,
      },
    ],
    startAt: '2026-03-15T10:00:00Z',
    teamMemberId: 'TEAM_789',
    customer: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-1234',
    },
  };

  it('accepts valid multi-segment input', () => {
    const result = createMultiBookingSchema.safeParse(validMultiInput);
    expect(result.success).toBe(true);
  });

  it('accepts single segment', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      segments: [validMultiInput.segments[0]],
    });
    expect(result.success).toBe(true);
  });

  it('accepts customer note', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      customer: { ...validMultiInput.customer, note: 'Sensitive scalp' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty segments array', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      segments: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 segments', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      segments: Array.from({ length: 6 }, (_, i) => ({
        serviceVariationId: `SVC_${i}`,
        serviceVariationVersion: '123',
        durationMinutes: 30,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('rejects segment with empty serviceVariationId', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      segments: [{ ...validMultiInput.segments[0], serviceVariationId: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects segment with zero durationMinutes', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      segments: [{ ...validMultiInput.segments[0], durationMinutes: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing startAt', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      startAt: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid customer email', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      customer: { ...validMultiInput.customer, email: 'bad-email' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects customer note over 2000 chars', () => {
    const result = createMultiBookingSchema.safeParse({
      ...validMultiInput,
      customer: { ...validMultiInput.customer, note: 'a'.repeat(2001) },
    });
    expect(result.success).toBe(false);
  });
});

describe('rescheduleBookingSchema', () => {
  it('accepts valid input', () => {
    const result = rescheduleBookingSchema.safeParse({
      version: 3,
      startAt: '2026-03-20T14:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing startAt', () => {
    const result = rescheduleBookingSchema.safeParse({
      version: 3,
      startAt: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero version (Square starts at 0)', () => {
    const result = rescheduleBookingSchema.safeParse({
      version: 0,
      startAt: '2026-03-20T14:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-integer version', () => {
    const result = rescheduleBookingSchema.safeParse({
      version: 3.5,
      startAt: '2026-03-20T14:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('acceptBookingSchema', () => {
  it('accepts valid version', () => {
    const result = acceptBookingSchema.safeParse({ version: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts zero version (Square starts at 0)', () => {
    const result = acceptBookingSchema.safeParse({ version: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects negative version', () => {
    const result = acceptBookingSchema.safeParse({ version: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer version', () => {
    const result = acceptBookingSchema.safeParse({ version: 2.5 });
    expect(result.success).toBe(false);
  });
});
