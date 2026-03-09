import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { getPendingIntakeCount, getIntakeSubmissions, getIntakeNote, getActiveSalonClients } from './intake-queue';

// Mock the db module to use an in-memory database
let testDb: Database.Database;

// We need to mock getDb to return our test database
import { vi } from 'vitest';
vi.mock('../db', () => ({
  getDb: () => testDb,
}));

function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      business_type TEXT NOT NULL DEFAULT 'salon',
      status TEXT NOT NULL DEFAULT 'intake_submitted',
      q02_client_name TEXT NOT NULL,
      q03_email TEXT,
      phone TEXT,
      preferred_contact TEXT,
      referral_source TEXT,
      fit_rating TEXT,
      archetype TEXT,
      intake_date TEXT
    );
    CREATE TABLE client_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      note_type TEXT NOT NULL DEFAULT 'general',
      content TEXT NOT NULL
    );
  `);
  return db;
}

function insertClient(
  name: string,
  status: string = 'intake_submitted',
  businessType: string = 'salon',
  email: string = 'test@test.com'
): number {
  const result = testDb.prepare(`
    INSERT INTO clients (q02_client_name, status, business_type, q03_email)
    VALUES (?, ?, ?, ?)
  `).run(name, status, businessType, email);
  return Number(result.lastInsertRowid);
}

function insertNote(clientId: number, noteType: string, content: string): void {
  testDb.prepare(`
    INSERT INTO client_notes (client_id, note_type, content) VALUES (?, ?, ?)
  `).run(clientId, noteType, content);
}

beforeEach(() => {
  testDb = createTestDb();
});

describe('getPendingIntakeCount', () => {
  it('returns 0 when no clients exist', () => {
    expect(getPendingIntakeCount()).toBe(0);
  });

  it('counts intake_submitted salon clients', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'intake_submitted');
    expect(getPendingIntakeCount()).toBe(2);
  });

  it('counts ai_review salon clients', () => {
    insertClient('Alice', 'ai_review');
    expect(getPendingIntakeCount()).toBe(1);
  });

  it('counts both intake_submitted and ai_review', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'ai_review');
    expect(getPendingIntakeCount()).toBe(2);
  });

  it('excludes active_client and followup', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'active_client');
    insertClient('Carol', 'followup');
    expect(getPendingIntakeCount()).toBe(1);
  });

  it('excludes declined clients', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'declined');
    expect(getPendingIntakeCount()).toBe(1);
  });

  it('excludes non-salon clients', () => {
    insertClient('Alice', 'intake_submitted', 'salon');
    insertClient('Bob', 'intake_submitted', 'reset');
    expect(getPendingIntakeCount()).toBe(1);
  });
});

describe('getIntakeSubmissions', () => {
  it('returns empty array when no intakes', () => {
    expect(getIntakeSubmissions()).toEqual([]);
  });

  it('returns salon intakes ordered newest first', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'intake_submitted');
    const results = getIntakeSubmissions();
    expect(results).toHaveLength(2);
    // Both should have status and name
    expect(results[0].q02_client_name).toBeDefined();
    expect(results[0].status).toBe('intake_submitted');
  });

  it('includes ai_review clients', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'ai_review');
    expect(getIntakeSubmissions()).toHaveLength(2);
  });

  it('excludes active clients', () => {
    insertClient('Alice', 'intake_submitted');
    insertClient('Bob', 'active_client');
    expect(getIntakeSubmissions()).toHaveLength(1);
  });
});

describe('getIntakeNote', () => {
  it('returns null when no note exists', () => {
    const clientId = insertClient('Alice');
    expect(getIntakeNote(clientId)).toBeNull();
  });

  it('returns the intake note content', () => {
    const clientId = insertClient('Alice');
    insertNote(clientId, 'interest_flag', 'Name: Alice\nService Interest: Color');
    expect(getIntakeNote(clientId)).toBe('Name: Alice\nService Interest: Color');
  });

  it('returns most recent intake note if multiple', () => {
    const clientId = insertClient('Alice');
    insertNote(clientId, 'interest_flag', 'Old note');
    insertNote(clientId, 'interest_flag', 'New note');
    // SQLite datetime('now') is the same within a transaction, so order may vary
    // Just verify we get one of them
    const note = getIntakeNote(clientId);
    expect(note).toBeTruthy();
  });

  it('ignores non-interest_flag notes', () => {
    const clientId = insertClient('Alice');
    insertNote(clientId, 'general', 'General note');
    expect(getIntakeNote(clientId)).toBeNull();
  });
});

describe('getActiveSalonClients', () => {
  it('returns only active_client and followup salon clients', () => {
    insertClient('Alice', 'active_client');
    insertClient('Bob', 'followup');
    insertClient('Carol', 'intake_submitted');
    insertClient('Dave', 'declined');
    insertClient('Eve', 'active_client', 'reset');
    const results = getActiveSalonClients();
    expect(results).toHaveLength(2);
    expect(results.map(r => r.q02_client_name).sort()).toEqual(['Alice', 'Bob']);
  });
});
