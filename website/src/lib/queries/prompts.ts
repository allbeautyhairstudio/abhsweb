import { getDb } from '../db';

export interface GeneratedPromptRow {
  id: number;
  client_id: number;
  prompt_code: string;
  populated_prompt: string;
  generated_at: string;
  ai_output: string | null;
}

/** Get all generated prompts for a client. */
export function getPromptsByClientId(clientId: number): GeneratedPromptRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM generated_prompts WHERE client_id = ? ORDER BY id ASC'
  ).all(clientId) as GeneratedPromptRow[];
}

/** Get a single generated prompt by client + code. */
export function getPromptByCode(clientId: number, promptCode: string): GeneratedPromptRow | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM generated_prompts WHERE client_id = ? AND prompt_code = ?'
  ).get(clientId, promptCode) as GeneratedPromptRow | undefined;
}

/** Upsert a generated prompt (insert or update). */
export function upsertGeneratedPrompt(
  clientId: number,
  promptCode: string,
  populatedPrompt: string,
): void {
  const db = getDb();
  const existing = getPromptByCode(clientId, promptCode);
  if (existing) {
    db.prepare(
      "UPDATE generated_prompts SET populated_prompt = ?, generated_at = datetime('now') WHERE id = ?"
    ).run(populatedPrompt, existing.id);
  } else {
    db.prepare(
      'INSERT INTO generated_prompts (client_id, prompt_code, populated_prompt) VALUES (?, ?, ?)'
    ).run(clientId, promptCode, populatedPrompt);
  }
}

/** Save AI output for a specific prompt (paste-back). */
export function saveAiOutput(clientId: number, promptCode: string, aiOutput: string): void {
  const db = getDb();
  db.prepare(
    'UPDATE generated_prompts SET ai_output = ? WHERE client_id = ? AND prompt_code = ?'
  ).run(aiOutput, clientId, promptCode);
}

/** Get chain outputs (ai_output values) for chain-dependent prompts. */
export function getChainOutputs(clientId: number): Record<string, string> {
  const db = getDb();
  const rows = db.prepare(
    'SELECT prompt_code, ai_output FROM generated_prompts WHERE client_id = ? AND ai_output IS NOT NULL'
  ).all(clientId) as Array<{ prompt_code: string; ai_output: string }>;

  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.prompt_code] = row.ai_output;
  }
  return result;
}
