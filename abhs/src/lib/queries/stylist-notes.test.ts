import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';

// Mock getDb to return our in-memory database
let db: Database.Database;
vi.mock('../db', () => ({
  getDb: () => db,
}));

// Import AFTER mocking
import { getStylistNote, upsertStylistNote } from './notes';

describe('stylist notes', () => {
  beforeEach(() => {
    vi.resetModules();
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        q02_client_name TEXT NOT NULL DEFAULT 'Test'
      );
      CREATE TABLE client_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        note_type TEXT NOT NULL DEFAULT 'general',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    db.prepare('INSERT INTO clients (q02_client_name) VALUES (?)').run('Test Client');
  });

  it('getStylistNote returns null when no note exists', () => {
    const result = getStylistNote(1);
    expect(result).toBeNull();
  });

  it('upsertStylistNote creates a new note when none exists', () => {
    upsertStylistNote(1, 'Fine hair, needs volume at roots');
    const result = getStylistNote(1);
    expect(result).toBe('Fine hair, needs volume at roots');
  });

  it('upsertStylistNote updates existing note (not duplicates)', () => {
    upsertStylistNote(1, 'First assessment');
    upsertStylistNote(1, 'Updated assessment with more detail');
    const result = getStylistNote(1);
    expect(result).toBe('Updated assessment with more detail');

    // Verify only one stylist_assessment note exists
    const count = db.prepare(
      "SELECT COUNT(*) as cnt FROM client_notes WHERE client_id = 1 AND note_type = 'stylist_assessment'"
    ).get() as { cnt: number };
    expect(count.cnt).toBe(1);
  });

  it('note has type stylist_assessment', () => {
    upsertStylistNote(1, 'Assessment content');
    const row = db.prepare(
      "SELECT note_type FROM client_notes WHERE client_id = 1 AND note_type = 'stylist_assessment'"
    ).get() as { note_type: string };
    expect(row.note_type).toBe('stylist_assessment');
  });

  it('getStylistNote ignores other note types', () => {
    db.prepare(
      "INSERT INTO client_notes (client_id, note_type, content) VALUES (1, 'general', 'A general note')"
    ).run();
    const result = getStylistNote(1);
    expect(result).toBeNull();
  });
});
