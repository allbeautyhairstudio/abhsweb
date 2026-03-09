/**
 * Input sanitization utilities.
 * Prevents XSS by escaping HTML entities in user-provided strings.
 * Applied to all text inputs before database storage and display.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const HTML_ENTITY_PATTERN = /[&<>"']/g;

/**
 * Escapes HTML entities in a string to prevent XSS.
 */
export function escapeHtml(input: string): string {
  return input.replace(HTML_ENTITY_PATTERN, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitizes a string input: trims whitespace and escapes HTML entities.
 * Returns null for empty strings.
 */
export function sanitizeString(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const str = String(input).trim();
  if (str === '') return null;
  return escapeHtml(str);
}

/**
 * Sanitizes a JSON array string (for checkbox fields).
 * Validates it's a proper JSON array of strings, sanitizes each element.
 */
export function sanitizeJsonArray(input: unknown): string | null {
  if (input === null || input === undefined) return null;

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) return null;
      const sanitized = parsed.map((item: unknown) => sanitizeString(item)).filter(Boolean);
      return JSON.stringify(sanitized);
    } catch {
      return null;
    }
  }

  if (Array.isArray(input)) {
    const sanitized = input.map((item: unknown) => sanitizeString(item)).filter(Boolean);
    return JSON.stringify(sanitized);
  }

  return null;
}

/**
 * Sanitizes a numeric input.
 * Returns null for non-numeric or out-of-range values.
 */
export function sanitizeNumber(input: unknown, min?: number, max?: number): number | null {
  if (input === null || input === undefined) return null;
  const num = Number(input);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

/**
 * Sanitizes all string fields in an object.
 * Used for bulk-sanitizing client form data before database insertion.
 */
export function sanitizeClientData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // JSON array fields (checkbox questions)
    if (['q17_client_sources', 'q22_marketing_feelings', 'q23_hardest_now',
         'q25_platforms_used', 'q28_stopped_reason', 'q37_help_wanted',
         'q45_proof_assets'].includes(key)) {
      sanitized[key] = sanitizeJsonArray(value);
    }
    // Numeric fields
    else if (['q13_marketing_confidence', 'q48_consent', 'price_paid',
              'time_tier', 'testimonial_received', 'referrals_given'].includes(key)) {
      sanitized[key] = sanitizeNumber(value);
    }
    // Everything else is a string
    else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    }
    // Pass through non-string, non-null values (booleans, etc.)
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
