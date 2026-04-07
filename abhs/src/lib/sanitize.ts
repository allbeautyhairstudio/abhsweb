/**
 * Input sanitization utilities.
 * Prevents XSS, spam, code injection, and prompt injection.
 * Applied to all text inputs before database storage and display.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const HTML_ENTITY_PATTERN = /[&<>"]/g;

/**
 * Escapes HTML entities in a string to prevent XSS.
 */
export function escapeHtml(input: string): string {
  return input.replace(HTML_ENTITY_PATTERN, (char) => HTML_ENTITIES[char] || char);
}

// --- Input quality checks ---

/** Detects repetitive spam like "JoicoJoicoJoico" or "aaaaaaa" */
function hasRepetitivePattern(input: string): boolean {
  const lower = input.toLowerCase().replace(/\s+/g, '');
  if (lower.length < 10) return false;

  // Check for any 3-20 char substring repeated 4+ times consecutively
  for (let len = 3; len <= Math.min(20, Math.floor(lower.length / 4)); len++) {
    const chunk = lower.slice(0, len);
    const repeated = chunk.repeat(4);
    if (lower.includes(repeated)) return true;
  }

  // Check for single character repeated 8+ times
  if (/(.)\1{7,}/.test(lower)) return true;

  return false;
}

/** Detects script tags, SQL injection, and code patterns */
function hasCodeInjection(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    /<script[\s>]/i,
    /<\/script>/i,
    /javascript:/i,
    /on(load|error|click|mouseover|focus)\s*=/i,
    /\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+.*\s+set)\b/i,
    /--\s*$|;\s*--/,
    /\b(eval|exec|execute)\s*\(/i,
    /<iframe[\s>]/i,
    /<object[\s>]/i,
    /<embed[\s>]/i,
    /data:text\/html/i,
    /\bxss\b/i,
  ];
  return patterns.some(p => p.test(lower));
}

/** Detects prompt injection attempts targeting AI systems */
function hasPromptInjection(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
    /you\s+are\s+now\s+(a|an|my)\s/i,
    /system\s*prompt/i,
    /\bact\s+as\b/i,
    /\brole\s*:\s*(system|assistant|user)\b/i,
    /\b(jailbreak|DAN|do anything now)\b/i,
    /pretend\s+you/i,
    /new\s+instructions?\s*:/i,
    /forget\s+(everything|your|all)/i,
    /override\s+(your|the|all)\s/i,
  ];
  return patterns.some(p => p.test(lower));
}

export type InputCheckResult = { ok: true } | { ok: false; reason: string };

/**
 * Validates input quality -- catches spam, injection, and abuse.
 * Call this on free-text fields before storing.
 */
export function checkInputQuality(input: string): InputCheckResult {
  if (hasRepetitivePattern(input)) {
    return { ok: false, reason: 'Please provide a real answer instead of repeated text.' };
  }
  if (hasCodeInjection(input)) {
    return { ok: false, reason: 'Your input contains content that isn\'t allowed. Please use plain text.' };
  }
  if (hasPromptInjection(input)) {
    return { ok: false, reason: 'Your input contains content that isn\'t allowed. Please use plain text.' };
  }
  return { ok: true };
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
         'q45_proof_assets', 'services_received'].includes(key)) {
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
