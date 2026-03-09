import { describe, it, expect } from 'vitest';

/** Tests for the client export data contract.
 *  Validates the shape and structure of export JSON without requiring a live database. */

interface ExportData {
  exported_at: string;
  client: Record<string, unknown>;
  notes: Array<Record<string, unknown>>;
  deliverables: Array<Record<string, unknown>>;
  generated_prompts: Array<Record<string, unknown>>;
}

function buildExportData(
  client: Record<string, unknown>,
  notes: Array<Record<string, unknown>>,
  deliverables: Array<Record<string, unknown>>,
  prompts: Array<Record<string, unknown>>,
): ExportData {
  return {
    exported_at: new Date().toISOString(),
    client,
    notes,
    deliverables,
    generated_prompts: prompts,
  };
}

function buildExportFilename(clientName: string, date: string): string {
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `${safeName}-export-${date}.json`;
}

describe('Export Data Structure', () => {
  it('produces all 4 required sections', () => {
    const data = buildExportData(
      { id: 1, q02_client_name: 'Test Client' },
      [],
      [],
      [],
    );
    expect(data).toHaveProperty('exported_at');
    expect(data).toHaveProperty('client');
    expect(data).toHaveProperty('notes');
    expect(data).toHaveProperty('deliverables');
    expect(data).toHaveProperty('generated_prompts');
  });

  it('exported_at is a valid ISO date string', () => {
    const data = buildExportData({ id: 1 }, [], [], []);
    const date = new Date(data.exported_at);
    expect(date.toISOString()).toBe(data.exported_at);
  });

  it('includes client data as-is', () => {
    const client = { id: 1, q02_client_name: 'Karli', status: 'inquiry', price_paid: 197 };
    const data = buildExportData(client, [], [], []);
    expect(data.client).toEqual(client);
  });

  it('includes notes array', () => {
    const notes = [
      { id: 1, client_id: 1, note_type: 'general', content: 'Test note' },
      { id: 2, client_id: 1, note_type: 'session', content: 'Session note' },
    ];
    const data = buildExportData({ id: 1 }, notes, [], []);
    expect(data.notes).toHaveLength(2);
    expect(data.notes[0]).toEqual(notes[0]);
  });

  it('includes deliverables array', () => {
    const deliverables = [
      { id: 1, client_id: 1, deliverable_type: 'roadmap', status: 'generated' },
    ];
    const data = buildExportData({ id: 1 }, [], deliverables, []);
    expect(data.deliverables).toHaveLength(1);
    expect(data.deliverables[0]).toEqual(deliverables[0]);
  });

  it('includes generated prompts with AI output', () => {
    const prompts = [
      { id: 1, client_id: 1, prompt_code: 'QS', populated_prompt: 'test...', ai_output: 'response...' },
      { id: 2, client_id: 1, prompt_code: 'MA', populated_prompt: 'test2...', ai_output: null },
    ];
    const data = buildExportData({ id: 1 }, [], [], prompts);
    expect(data.generated_prompts).toHaveLength(2);
    expect(data.generated_prompts[0]).toEqual(prompts[0]);
    expect(data.generated_prompts[1].ai_output).toBeNull();
  });

  it('handles empty arrays for notes, deliverables, prompts', () => {
    const data = buildExportData({ id: 1 }, [], [], []);
    expect(data.notes).toEqual([]);
    expect(data.deliverables).toEqual([]);
    expect(data.generated_prompts).toEqual([]);
  });
});

describe('Export Filename', () => {
  it('generates a safe filename from client name', () => {
    expect(buildExportFilename('Karli Rosario', '2026-02-23')).toBe('karli-rosario-export-2026-02-23.json');
  });

  it('replaces special characters with hyphens', () => {
    expect(buildExportFilename("O'Brien & Co.", '2026-01-15')).toBe('o-brien---co--export-2026-01-15.json');
  });

  it('lowercases the name', () => {
    expect(buildExportFilename('ALLCAPS', '2026-03-01')).toBe('allcaps-export-2026-03-01.json');
  });

  it('handles empty name', () => {
    expect(buildExportFilename('', '2026-02-23')).toBe('-export-2026-02-23.json');
  });
});
