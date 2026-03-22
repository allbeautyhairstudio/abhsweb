import { getDb } from '../db';

export interface ChatMessageRow {
  id: number;
  client_id: number;
  role: 'user' | 'assistant';
  content: string;
  channel_context: string | null;
  created_at: string;
}

/**
 * Get chat messages for a client, oldest first.
 * Optional limit returns the N most recent messages (for context window).
 */
export function getChatMessages(clientId: number, limit?: number): ChatMessageRow[] {
  const db = getDb();
  if (limit) {
    return db.prepare(`
      SELECT * FROM (
        SELECT * FROM chat_messages
        WHERE client_id = ?
        ORDER BY id DESC
        LIMIT ?
      ) ORDER BY id ASC
    `).all(clientId, limit) as ChatMessageRow[];
  }
  return db.prepare(
    'SELECT * FROM chat_messages WHERE client_id = ? ORDER BY id ASC'
  ).all(clientId) as ChatMessageRow[];
}

/** Create a chat message. Returns the new message ID. */
export function createChatMessage(
  clientId: number,
  role: 'user' | 'assistant',
  content: string,
  channelContext?: string | null
): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO chat_messages (client_id, role, content, channel_context) VALUES (?, ?, ?, ?)'
  ).run(clientId, role, content, channelContext ?? null);
  return result.lastInsertRowid as number;
}

/** Delete all chat messages for a client. Returns count of deleted rows. */
export function deleteChatMessagesByClientId(clientId: number): number {
  const db = getDb();
  const result = db.prepare('DELETE FROM chat_messages WHERE client_id = ?').run(clientId);
  return result.changes;
}
