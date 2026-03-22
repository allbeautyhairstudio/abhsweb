import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';

// Mock getDb to return our in-memory database
let db: Database.Database;
vi.mock('../db', () => ({
  getDb: () => db,
}));

// Import AFTER mocking
import {
  getChatMessages,
  createChatMessage,
  deleteChatMessagesByClientId,
} from './chat';

describe('chat queries', () => {
  beforeEach(() => {
    vi.resetModules();
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        q02_client_name TEXT NOT NULL DEFAULT 'Test'
      );
      CREATE TABLE chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        channel_context TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    db.prepare('INSERT INTO clients (q02_client_name) VALUES (?)').run('Test Client');
  });

  it('creates a user message and returns the ID', () => {
    const id = createChatMessage(1, 'user', 'Hello Karli here');
    expect(id).toBe(1);
  });

  it('creates an assistant message with channel context', () => {
    const id = createChatMessage(1, 'assistant', 'Here is a draft', 'email');
    expect(id).toBe(1);
    const msgs = getChatMessages(1);
    expect(msgs[0].channel_context).toBe('email');
  });

  it('returns messages in chronological order (oldest first)', () => {
    createChatMessage(1, 'user', 'First');
    createChatMessage(1, 'assistant', 'Second');
    createChatMessage(1, 'user', 'Third');
    const msgs = getChatMessages(1);
    expect(msgs).toHaveLength(3);
    expect(msgs[0].content).toBe('First');
    expect(msgs[2].content).toBe('Third');
  });

  it('returns empty array for client with no messages', () => {
    const msgs = getChatMessages(999);
    expect(msgs).toEqual([]);
  });

  it('respects limit parameter for history window', () => {
    for (let i = 0; i < 40; i++) {
      createChatMessage(1, i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`);
    }
    const msgs = getChatMessages(1, 30);
    expect(msgs).toHaveLength(30);
    // Should return the LAST 30 (most recent)
    expect(msgs[0].content).toBe('Message 10');
    expect(msgs[29].content).toBe('Message 39');
  });

  it('deletes all messages for a client', () => {
    createChatMessage(1, 'user', 'Message 1');
    createChatMessage(1, 'assistant', 'Message 2');
    const deleted = deleteChatMessagesByClientId(1);
    expect(deleted).toBe(2);
    expect(getChatMessages(1)).toEqual([]);
  });
});
