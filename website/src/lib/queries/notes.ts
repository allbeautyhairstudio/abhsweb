import { getDb } from '../db';

export interface NoteRow {
  id: number;
  client_id: number;
  created_at: string;
  note_type: string;
  content: string;
}

export interface ChecklistState {
  [item: string]: boolean;
}

/** Get a single note by ID. */
export function getNoteById(noteId: number): NoteRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM client_notes WHERE id = ?').get(noteId) as NoteRow | undefined;
}

/** Delete a note by ID. Returns true if a row was deleted. */
export function deleteNote(noteId: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM client_notes WHERE id = ?').run(noteId);
  return result.changes > 0;
}

/** Get all notes for a client, newest first. */
export function getNotesByClientId(clientId: number): NoteRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM client_notes WHERE client_id = ? ORDER BY created_at DESC'
  ).all(clientId) as NoteRow[];
}

/** Create a new note. */
export function createNote(clientId: number, noteType: string, content: string): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO client_notes (client_id, note_type, content) VALUES (?, ?, ?)'
  ).run(clientId, noteType, content);
  return result.lastInsertRowid as number;
}

/**
 * Get checklist completion state for a client at a specific stage.
 * Stored as checklist notes with JSON content: { stage, item, completed }
 */
export function getChecklist(clientId: number, stage: string): ChecklistState {
  const db = getDb();
  const rows = db.prepare(
    "SELECT content FROM client_notes WHERE client_id = ? AND note_type = 'checklist'"
  ).all(clientId) as Array<{ content: string }>;

  const state: ChecklistState = {};
  for (const row of rows) {
    try {
      const data = JSON.parse(row.content);
      if (data.stage === stage) {
        state[data.item] = data.completed;
      }
    } catch {
      // Skip malformed entries
    }
  }
  return state;
}

/**
 * Toggle a checklist item on/off.
 * Upserts: updates existing or creates new.
 */
export function toggleChecklistItem(
  clientId: number,
  stage: string,
  item: string,
  completed: boolean
): void {
  const db = getDb();

  // Find existing checklist note for this stage+item
  const rows = db.prepare(
    "SELECT id, content FROM client_notes WHERE client_id = ? AND note_type = 'checklist'"
  ).all(clientId) as Array<{ id: number; content: string }>;

  let existingId: number | null = null;
  for (const row of rows) {
    try {
      const data = JSON.parse(row.content);
      if (data.stage === stage && data.item === item) {
        existingId = row.id;
        break;
      }
    } catch {
      // Skip malformed
    }
  }

  const content = JSON.stringify({ stage, item, completed });

  if (existingId !== null) {
    db.prepare('UPDATE client_notes SET content = ? WHERE id = ?').run(content, existingId);
  } else {
    db.prepare(
      "INSERT INTO client_notes (client_id, note_type, content) VALUES (?, 'checklist', ?)"
    ).run(clientId, content);
  }
}
