import { describe, it, expect } from 'vitest';
import { cleanPhone } from './client-contact-actions';

describe('cleanPhone', () => {
  it('strips parentheses and dashes', () => {
    expect(cleanPhone('(555) 123-4567')).toBe('5551234567');
  });

  it('strips spaces only', () => {
    expect(cleanPhone('555 123 4567')).toBe('5551234567');
  });

  it('passes through already-clean digits', () => {
    expect(cleanPhone('5551234567')).toBe('5551234567');
  });

  it('strips dots', () => {
    expect(cleanPhone('555.123.4567')).toBe('5551234567');
  });

  it('handles +1 country code', () => {
    expect(cleanPhone('+1 (951) 555-1234')).toBe('19515551234');
  });

  it('handles empty string', () => {
    expect(cleanPhone('')).toBe('');
  });
});
