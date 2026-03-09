import { INTAKE_FIELDS } from '@/lib/constants/intake-fields';
import { FIELD_MAPPINGS, YEARS_LABELS } from '@/lib/constants/field-mappings';
import { PROMPT_TEMPLATES, type PromptTemplate } from '@/lib/constants/prompt-templates';

/** Generic client row — keyed by column name. */
export type ClientRecord = Record<string, unknown>;

export interface PopulatedPrompt {
  prompt_code: string;
  populated_prompt: string;
  is_ready: boolean;
  missing_dependency?: string;
  has_unfilled_placeholders: boolean;
}

// ---------------------------------------------------------------------------
// Intake data block
// ---------------------------------------------------------------------------

/** Format all 48 intake answers into a structured text block.
 *  Replaces [PASTE FULL INTAKE RESPONSES HERE] in backend analysis prompts. */
export function formatIntakeDataBlock(client: ClientRecord): string {
  const lines: string[] = [];
  let currentSection = 0;

  for (const field of INTAKE_FIELDS) {
    if (field.section !== currentSection) {
      currentSection = field.section;
      if (lines.length > 0) lines.push('');
      lines.push(`--- SECTION ${field.section}: ${field.sectionName.toUpperCase()} ---`);
    }
    const value = client[field.key];
    const display = formatFieldValue(field.key, value, field.isJsonArray);
    lines.push(`${field.label}: ${display}`);
  }

  return lines.join('\n');
}

function formatFieldValue(key: string, value: unknown, isJsonArray?: boolean): string {
  if (value === null || value === undefined || value === '') return '(not provided)';

  if (isJsonArray) {
    return safeParseJsonArray(String(value)).join(', ') || String(value);
  }

  if (key === 'q06_years_in_business') {
    return YEARS_LABELS[String(value)] ?? String(value);
  }

  if (key === 'q48_consent') {
    return value === 1 || value === '1' ? 'Yes' : 'No';
  }

  return String(value);
}

/** Safely parse a JSON array string. Returns empty array on failure. */
export function safeParseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Field placeholder replacement
// ---------------------------------------------------------------------------

/** Escape special regex characters. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Apply a transform to a field value. */
function applyTransform(value: string, transform?: string): string {
  switch (transform) {
    case 'join_array':
      return safeParseJsonArray(value).join(', ') || value;
    case 'first_array_item': {
      const items = safeParseJsonArray(value);
      return items[0] ?? value;
    }
    case 'years_label':
      return YEARS_LABELS[value] ?? value;
    default:
      return value;
  }
}

/** Replace all known field-level placeholders in a template string. */
export function replaceFieldPlaceholders(template: string, client: ClientRecord): string {
  let result = template;

  for (const mapping of FIELD_MAPPINGS) {
    const pattern = new RegExp(`\\[${escapeRegex(mapping.placeholder)}\\]`, 'gi');
    const rawValue = client[mapping.field];
    let displayValue: string;

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      displayValue = mapping.fallback;
    } else {
      displayValue = applyTransform(String(rawValue), mapping.transform);
    }

    result = result.replace(pattern, displayValue);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Populate a single prompt
// ---------------------------------------------------------------------------

/** Populate a single prompt template with client data and optional chain outputs. */
export function populatePrompt(
  promptTemplate: PromptTemplate,
  client: ClientRecord,
  chainOutputs?: Record<string, string>,
): PopulatedPrompt {
  let text = promptTemplate.template;

  // Replace [PASTE FULL INTAKE RESPONSES HERE]
  text = text.replace(
    /\[PASTE FULL INTAKE RESPONSES HERE\]/gi,
    formatIntakeDataBlock(client),
  );

  // Replace Q47 placeholder
  const q47 = client.q47_anything_else;
  text = text.replace(
    /\[PASTE THEIR RESPONSE TO QUESTION 47 HERE\]/gi,
    q47 && String(q47).trim() ? String(q47) : '(Client left this blank)',
  );

  // Replace chain dependency placeholders
  if (promptTemplate.chain_dependency && chainOutputs) {
    const depOutput = chainOutputs[promptTemplate.chain_dependency];
    if (depOutput) {
      text = text.replace(
        /\[PASTE THE STEP 1 OUTPUT FROM THE MASTER ANALYSIS\]/gi,
        depOutput,
      );
      text = text.replace(
        /\[PASTE THE CLIENT PROFILE SUMMARY FROM PROMPT 4, OR KEY INTAKE HIGHLIGHTS\]/gi,
        depOutput,
      );
    }
  }

  // Replace all field-level placeholders
  text = replaceFieldPlaceholders(text, client);

  // Determine readiness
  const missingChain = promptTemplate.chain_dependency &&
    (!chainOutputs || !chainOutputs[promptTemplate.chain_dependency]);

  // Check for remaining unfilled placeholders (uppercase words in brackets)
  const hasUnfilled = /\[[A-Z][A-Z\s/\-—,.'&:()]+\]/.test(text);

  return {
    prompt_code: promptTemplate.code,
    populated_prompt: text,
    is_ready: !missingChain,
    missing_dependency: missingChain ? promptTemplate.chain_dependency : undefined,
    has_unfilled_placeholders: hasUnfilled,
  };
}

// ---------------------------------------------------------------------------
// Populate all prompts
// ---------------------------------------------------------------------------

/** Populate ALL prompt templates for a client. */
export function populateAllPrompts(
  client: ClientRecord,
  chainOutputs?: Record<string, string>,
): PopulatedPrompt[] {
  return PROMPT_TEMPLATES.map(t => populatePrompt(t, client, chainOutputs));
}
