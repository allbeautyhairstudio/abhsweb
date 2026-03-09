import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeString,
  sanitizeJsonArray,
  sanitizeNumber,
  sanitizeClientData,
} from './sanitize';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes quotes', () => {
    expect(escapeHtml('She said "hello"')).toBe('She said &quot;hello&quot;');
    expect(escapeHtml("It's fine")).toBe('It&#x27;s fine');
  });

  it('returns unchanged string with no special chars', () => {
    expect(escapeHtml('Normal text 123')).toBe('Normal text 123');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('sanitizeString', () => {
  it('trims whitespace and escapes HTML', () => {
    expect(sanitizeString('  hello <world>  ')).toBe('hello &lt;world&gt;');
  });

  it('returns null for null/undefined', () => {
    expect(sanitizeString(null)).toBeNull();
    expect(sanitizeString(undefined)).toBeNull();
  });

  it('returns null for empty or whitespace-only strings', () => {
    expect(sanitizeString('')).toBeNull();
    expect(sanitizeString('   ')).toBeNull();
  });

  it('converts non-string values to string', () => {
    expect(sanitizeString(42)).toBe('42');
    expect(sanitizeString(true)).toBe('true');
  });
});

describe('sanitizeJsonArray', () => {
  it('parses and sanitizes a JSON array string', () => {
    const input = '["Instagram", "Facebook", "<script>"]';
    const result = sanitizeJsonArray(input);
    expect(result).toBe('["Instagram","Facebook","&lt;script&gt;"]');
  });

  it('handles array input directly', () => {
    const input = ['Instagram', 'TikTok'];
    const result = sanitizeJsonArray(input);
    expect(result).toBe('["Instagram","TikTok"]');
  });

  it('returns null for non-array JSON', () => {
    expect(sanitizeJsonArray('{"key": "value"}')).toBeNull();
    expect(sanitizeJsonArray('"just a string"')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(sanitizeJsonArray(null)).toBeNull();
    expect(sanitizeJsonArray(undefined)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(sanitizeJsonArray('not json at all')).toBeNull();
  });

  it('filters out empty/null array elements', () => {
    const input = ['Instagram', '', null, 'TikTok'];
    const result = sanitizeJsonArray(input);
    expect(result).toBe('["Instagram","TikTok"]');
  });
});

describe('sanitizeNumber', () => {
  it('returns the number for valid numeric input', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber('3.14')).toBe(3.14);
  });

  it('returns null for non-numeric input', () => {
    expect(sanitizeNumber('abc')).toBeNull();
    expect(sanitizeNumber(NaN)).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(sanitizeNumber(null)).toBeNull();
    expect(sanitizeNumber(undefined)).toBeNull();
  });

  it('enforces min bound', () => {
    expect(sanitizeNumber(0, 1)).toBeNull();
    expect(sanitizeNumber(1, 1)).toBe(1);
  });

  it('enforces max bound', () => {
    expect(sanitizeNumber(10, undefined, 5)).toBeNull();
    expect(sanitizeNumber(5, undefined, 5)).toBe(5);
  });

  it('enforces both bounds', () => {
    expect(sanitizeNumber(3, 1, 5)).toBe(3);
    expect(sanitizeNumber(0, 1, 5)).toBeNull();
    expect(sanitizeNumber(6, 1, 5)).toBeNull();
  });
});

describe('sanitizeClientData', () => {
  it('sanitizes string fields', () => {
    const data = { q02_client_name: '  Jane <Doe>  ', q01_business_name: 'Salon & Spa' };
    const result = sanitizeClientData(data);
    expect(result.q02_client_name).toBe('Jane &lt;Doe&gt;');
    expect(result.q01_business_name).toBe('Salon &amp; Spa');
  });

  it('sanitizes JSON array fields', () => {
    const data = { q25_platforms_used: '["Instagram", "<script>"]' };
    const result = sanitizeClientData(data);
    expect(result.q25_platforms_used).toBe('["Instagram","&lt;script&gt;"]');
  });

  it('sanitizes numeric fields', () => {
    const data = { q13_marketing_confidence: '3', price_paid: 250 };
    const result = sanitizeClientData(data);
    expect(result.q13_marketing_confidence).toBe(3);
    expect(result.price_paid).toBe(250);
  });

  it('passes through non-string non-special values', () => {
    const data = { some_boolean: true, some_number: 42 };
    const result = sanitizeClientData(data);
    expect(result.some_boolean).toBe(true);
    expect(result.some_number).toBe(42);
  });
});
