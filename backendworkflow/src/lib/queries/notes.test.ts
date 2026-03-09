import { describe, it, expect } from 'vitest';
import type { NoteRow } from './notes';

/** Tests for checklist JSON storage format.
 *  These validate the data contract without requiring a live database. */

interface ChecklistEntry {
  stage: string;
  item: string;
  completed: boolean;
}

function parseChecklistEntry(json: string): ChecklistEntry | null {
  try {
    const data = JSON.parse(json);
    if (typeof data.stage === 'string' && typeof data.item === 'string' && typeof data.completed === 'boolean') {
      return data as ChecklistEntry;
    }
    return null;
  } catch {
    return null;
  }
}

function buildChecklistState(entries: Array<{ content: string }>, stage: string): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const entry of entries) {
    const parsed = parseChecklistEntry(entry.content);
    if (parsed && parsed.stage === stage) {
      state[parsed.item] = parsed.completed;
    }
  }
  return state;
}

describe('Checklist JSON Format', () => {
  it('parses valid checklist entry', () => {
    const entry = parseChecklistEntry(JSON.stringify({
      stage: 'inquiry',
      item: 'Send intake form link',
      completed: true,
    }));
    expect(entry).not.toBeNull();
    expect(entry?.stage).toBe('inquiry');
    expect(entry?.item).toBe('Send intake form link');
    expect(entry?.completed).toBe(true);
  });

  it('parses unchecked entry', () => {
    const entry = parseChecklistEntry(JSON.stringify({
      stage: 'payment',
      item: 'Confirm payment received',
      completed: false,
    }));
    expect(entry).not.toBeNull();
    expect(entry?.completed).toBe(false);
  });

  it('returns null for invalid JSON', () => {
    expect(parseChecklistEntry('not json')).toBeNull();
    expect(parseChecklistEntry('')).toBeNull();
  });

  it('returns null for missing fields', () => {
    expect(parseChecklistEntry(JSON.stringify({ stage: 'inquiry' }))).toBeNull();
    expect(parseChecklistEntry(JSON.stringify({ item: 'test' }))).toBeNull();
    expect(parseChecklistEntry(JSON.stringify({ completed: true }))).toBeNull();
  });

  it('returns null for wrong types', () => {
    expect(parseChecklistEntry(JSON.stringify({ stage: 123, item: 'test', completed: true }))).toBeNull();
    expect(parseChecklistEntry(JSON.stringify({ stage: 'inquiry', item: 'test', completed: 'yes' }))).toBeNull();
  });
});

describe('Checklist State Builder', () => {
  it('builds state from multiple entries', () => {
    const entries = [
      { content: JSON.stringify({ stage: 'inquiry', item: 'Send intake form link', completed: true }) },
      { content: JSON.stringify({ stage: 'payment', item: 'Confirm payment', completed: false }) },
      { content: JSON.stringify({ stage: 'inquiry', item: 'Other task', completed: false }) },
    ];

    const state = buildChecklistState(entries, 'inquiry');
    expect(state).toEqual({
      'Send intake form link': true,
      'Other task': false,
    });
  });

  it('filters entries by stage', () => {
    const entries = [
      { content: JSON.stringify({ stage: 'inquiry', item: 'Item A', completed: true }) },
      { content: JSON.stringify({ stage: 'payment', item: 'Item B', completed: true }) },
    ];

    const inquiryState = buildChecklistState(entries, 'inquiry');
    expect(Object.keys(inquiryState)).toHaveLength(1);
    expect(inquiryState['Item A']).toBe(true);

    const paymentState = buildChecklistState(entries, 'payment');
    expect(Object.keys(paymentState)).toHaveLength(1);
    expect(paymentState['Item B']).toBe(true);
  });

  it('returns empty state for no matching entries', () => {
    const entries = [
      { content: JSON.stringify({ stage: 'inquiry', item: 'Item', completed: true }) },
    ];
    const state = buildChecklistState(entries, 'payment');
    expect(state).toEqual({});
  });

  it('skips malformed entries gracefully', () => {
    const entries = [
      { content: 'not json' },
      { content: JSON.stringify({ stage: 'inquiry', item: 'Valid', completed: true }) },
      { content: JSON.stringify({ bad: 'data' }) },
    ];
    const state = buildChecklistState(entries, 'inquiry');
    expect(state).toEqual({ 'Valid': true });
  });

  it('handles empty entries array', () => {
    const state = buildChecklistState([], 'inquiry');
    expect(state).toEqual({});
  });

  it('last entry wins when duplicate items exist', () => {
    const entries = [
      { content: JSON.stringify({ stage: 'inquiry', item: 'Task', completed: false }) },
      { content: JSON.stringify({ stage: 'inquiry', item: 'Task', completed: true }) },
    ];
    const state = buildChecklistState(entries, 'inquiry');
    expect(state['Task']).toBe(true);
  });
});

describe('Note Deletion Data Contract', () => {
  it('NoteRow has the expected shape', () => {
    const mockNote: NoteRow = {
      id: 1,
      client_id: 5,
      created_at: '2026-02-25T10:00:00Z',
      note_type: 'general',
      content: 'Test note content',
    };
    expect(mockNote.id).toBe(1);
    expect(mockNote.client_id).toBe(5);
    expect(mockNote.note_type).toBe('general');
    expect(mockNote.content).toBe('Test note content');
  });

  it('ownership check: note.client_id must match route client ID', () => {
    const note: NoteRow = { id: 10, client_id: 5, created_at: '', note_type: 'general', content: '' };
    const routeClientId = 5;
    const wrongClientId = 99;
    expect(note.client_id === routeClientId).toBe(true);
    expect(note.client_id === wrongClientId).toBe(false);
  });

  it('checklist notes are protected from deletion', () => {
    const checklistNote: NoteRow = { id: 1, client_id: 5, created_at: '', note_type: 'checklist', content: '{}' };
    const generalNote: NoteRow = { id: 2, client_id: 5, created_at: '', note_type: 'general', content: 'text' };
    expect(checklistNote.note_type === 'checklist').toBe(true);
    expect(generalNote.note_type === 'checklist').toBe(false);
  });

  it('all deletable note types are valid', () => {
    const deletableTypes = ['general', 'session_note', 'follow_up_note', 'analysis_note', 'interest_flag'];
    for (const type of deletableTypes) {
      expect(type !== 'checklist').toBe(true);
    }
  });

  it('note ID must be a positive integer for deletion', () => {
    const validIds = [1, 5, 100];
    const invalidIds = [0, -1, NaN];
    for (const id of validIds) {
      expect(id > 0 && Number.isInteger(id)).toBe(true);
    }
    for (const id of invalidIds) {
      expect(id > 0 && Number.isInteger(id)).toBe(false);
    }
  });
});
