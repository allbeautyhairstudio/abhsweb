import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serializeBigInt } from './square';

describe('serializeBigInt', () => {
  it('converts BigInt values to strings', () => {
    const input = { amount: BigInt(5000), currency: 'USD' };
    const result = serializeBigInt(input) as { amount: string; currency: string };
    expect(result.amount).toBe('5000');
    expect(result.currency).toBe('USD');
  });

  it('handles nested BigInt values', () => {
    const input = {
      booking: {
        version: BigInt(123456789),
        segments: [
          { serviceVariationVersion: BigInt(987654321) },
        ],
      },
    };
    const result = serializeBigInt(input) as {
      booking: {
        version: string;
        segments: Array<{ serviceVariationVersion: string }>;
      };
    };
    expect(result.booking.version).toBe('123456789');
    expect(result.booking.segments[0].serviceVariationVersion).toBe('987654321');
  });

  it('preserves non-BigInt values', () => {
    const input = {
      name: 'Service',
      price: 50.99,
      active: true,
      tags: ['hair', 'color'],
    };
    const result = serializeBigInt(input);
    expect(result).toEqual(input);
  });

  it('handles null values', () => {
    const result = serializeBigInt(null);
    expect(result).toBeNull();
  });

  it('handles empty objects', () => {
    const result = serializeBigInt({});
    expect(result).toEqual({});
  });

  it('handles arrays with BigInt', () => {
    const input = [BigInt(100), BigInt(200), BigInt(300)];
    const result = serializeBigInt(input);
    expect(result).toEqual(['100', '200', '300']);
  });

  it('handles mixed arrays', () => {
    const input = [BigInt(100), 'hello', 42, true];
    const result = serializeBigInt(input);
    expect(result).toEqual(['100', 'hello', 42, true]);
  });

  it('handles zero BigInt', () => {
    const result = serializeBigInt({ value: BigInt(0) }) as { value: string };
    expect(result.value).toBe('0');
  });

  it('handles negative BigInt', () => {
    const result = serializeBigInt({ value: BigInt(-500) }) as { value: string };
    expect(result.value).toBe('-500');
  });

  it('handles large BigInt values', () => {
    const large = BigInt('99999999999999999999');
    const result = serializeBigInt({ id: large }) as { id: string };
    expect(result.id).toBe('99999999999999999999');
  });
});

describe('getSquareClient', () => {
  beforeEach(() => {
    // Reset module cache between tests
    vi.resetModules();
  });

  it('throws when SQUARE_ACCESS_TOKEN is not set', async () => {
    // Clear env var
    const origToken = process.env.SQUARE_ACCESS_TOKEN;
    delete process.env.SQUARE_ACCESS_TOKEN;

    try {
      const { getSquareClient } = await import('./square');
      expect(() => getSquareClient()).toThrow('SQUARE_ACCESS_TOKEN not configured');
    } finally {
      if (origToken) process.env.SQUARE_ACCESS_TOKEN = origToken;
    }
  });
});

describe('getLocationId', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('throws when SQUARE_LOCATION_ID is not set', async () => {
    const origLocation = process.env.SQUARE_LOCATION_ID;
    delete process.env.SQUARE_LOCATION_ID;

    try {
      const { getLocationId } = await import('./square');
      expect(() => getLocationId()).toThrow('SQUARE_LOCATION_ID not configured');
    } finally {
      if (origLocation) process.env.SQUARE_LOCATION_ID = origLocation;
    }
  });

  it('returns the location ID when set', async () => {
    process.env.SQUARE_LOCATION_ID = 'LOC_TEST_123';

    try {
      const { getLocationId } = await import('./square');
      expect(getLocationId()).toBe('LOC_TEST_123');
    } finally {
      delete process.env.SQUARE_LOCATION_ID;
    }
  });
});
