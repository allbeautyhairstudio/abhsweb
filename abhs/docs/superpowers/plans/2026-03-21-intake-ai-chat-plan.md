# AI Chat for Intake Review — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a streaming Claude chat panel to the admin intake detail page so Karli can ask questions about intakes and draft client messages (SMS/email/both).

**Architecture:** SSE streaming via a Next.js API route that injects full intake context into Claude's system prompt. Chat history persisted in SQLite. Side panel on desktop, full screen on mobile. Anthropic SDK for Claude Sonnet.

**Tech Stack:** Next.js 16 (App Router), TypeScript, SQLite (better-sqlite3), @anthropic-ai/sdk, Tailwind CSS 4, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-21-intake-ai-chat-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/constants/chat-system-prompt.ts` | Karli's voice, salon context, channel instructions, guardrails |
| `src/lib/queries/chat.ts` | CRUD for chat_messages table |
| `src/lib/chat-context.ts` | Builds Claude messages array from intake data + history |
| `src/app/api/admin/chat/route.ts` | SSE streaming endpoint (POST) + history loader (GET) |
| `src/components/salon/intake-chat-panel.tsx` | Main chat panel (side panel desktop / full screen mobile) |
| `src/components/salon/chat-message.tsx` | Individual message bubble component |
| `src/lib/queries/chat.test.ts` | Tests for chat message CRUD |
| `src/lib/chat-context.test.ts` | Tests for context building + system prompt |

### Modified Files

| File | Change |
|------|--------|
| `src/lib/db.ts` | Add chat_messages table migration |
| `src/lib/queries/clients.ts` | Add cascade delete for chat_messages (and fix client_notes gap) |
| `src/app/admin/(dashboard)/intake/[id]/page.tsx` | Add IntakeChatPanel component |
| `package.json` | Add @anthropic-ai/sdk dependency |

---

## Task 1: Install Anthropic SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the SDK**

```bash
cd /c/kar/abhs && pnpm add @anthropic-ai/sdk
```

- [ ] **Step 2: Pin the version in package.json**

After install, verify the version is pinned (not `^` or `~`). Check `package.json` — if it shows a caret, remove it so it's an exact version like the Vite/Vitest pins.

- [ ] **Step 3: Add ANTHROPIC_API_KEY to .env.local**

```bash
# Add to .env.local (do NOT commit this file)
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 4: Add to .env.example**

Add a placeholder line to `.env.example`:
```
# AI Chat (Claude API for intake review assistant)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

- [ ] **Step 5: Verify tests still pass**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: 268 tests passing.

- [ ] **Step 6: Commit**

```bash
git add abhs/package.json abhs/pnpm-lock.yaml abhs/.env.example
git commit -m "feat: add @anthropic-ai/sdk for intake chat assistant"
```

---

## Task 2: Database — chat_messages Table + Cascade Deletes

**Files:**
- Modify: `src/lib/db.ts` (add migration)
- Modify: `src/lib/queries/clients.ts` (add cascade deletes)

- [ ] **Step 1: Create empty test file (tests will be added in Task 3)**

Create `src/lib/queries/chat.test.ts` as an empty file -- Task 3 will populate it with all chat query tests including table creation validation.

```typescript
// Tests added in Task 3 after query functions are implemented
export {};
```

- [ ] **Step 3: Add chat_messages migration to db.ts**

In `src/lib/db.ts`, after the existing migrations (around line 113, after the `consent_date` migration), add:

```typescript
    // Migration: create chat_messages table if missing
    if (!tableNames.has('chat_messages')) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          channel_context TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_chat_messages_client ON chat_messages(client_id);
      `);
    }
```

Note: The `tableNames` Set is already computed earlier in the function (line 70). Reuse it.

- [ ] **Step 4: Add cascade delete to deleteClient()**

In `src/lib/queries/clients.ts`, update `deleteClient` (line 185):

```typescript
export function deleteClient(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM chat_messages WHERE client_id = ?').run(id);
  db.prepare('DELETE FROM client_notes WHERE client_id = ?').run(id);
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
}
```

- [ ] **Step 5: Add cascade delete to deleteClients()**

In `src/lib/queries/clients.ts`, update `deleteClients` (line 246):

```typescript
export function deleteClients(ids: number[]): number {
  if (ids.length === 0) return 0;
  const db = getDb();
  const placeholders = ids.map(() => '?').join(', ');
  db.prepare(`DELETE FROM chat_messages WHERE client_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM client_notes WHERE client_id IN (${placeholders})`).run(...ids);
  const result = db.prepare(`DELETE FROM clients WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}
```

- [ ] **Step 6: Verify all tests pass**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All existing tests still passing.

- [ ] **Step 7: Commit**

```bash
git add abhs/src/lib/db.ts abhs/src/lib/queries/clients.ts abhs/src/lib/queries/chat.test.ts
git commit -m "feat: add chat_messages table and cascade deletes"
```

---

## Task 3: Chat Message CRUD Queries

**Files:**
- Create: `src/lib/queries/chat.ts`
- Modify: `src/lib/queries/chat.test.ts`

- [ ] **Step 1: Add CRUD tests to chat.test.ts**

Add a new describe block to `src/lib/queries/chat.test.ts`. These tests use the real query functions with an in-memory DB, following the pattern from `booking-requests.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /c/kar/abhs && npx vitest run src/lib/queries/chat.test.ts
```

Expected: FAIL — `getChatMessages`, `createChatMessage`, `deleteChatMessagesByClientId` not found.

- [ ] **Step 3: Implement chat.ts**

Create `src/lib/queries/chat.ts`:

```typescript
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
    // Subquery to get the last N messages, then re-sort ascending
    return db.prepare(`
      SELECT * FROM (
        SELECT * FROM chat_messages
        WHERE client_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      ) ORDER BY created_at ASC
    `).all(clientId, limit) as ChatMessageRow[];
  }
  return db.prepare(
    'SELECT * FROM chat_messages WHERE client_id = ? ORDER BY created_at ASC'
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /c/kar/abhs && npx vitest run src/lib/queries/chat.test.ts
```

Expected: All tests passing.

- [ ] **Step 5: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All existing tests plus new chat tests passing.

- [ ] **Step 6: Commit**

```bash
git add abhs/src/lib/queries/chat.ts abhs/src/lib/queries/chat.test.ts
git commit -m "feat: add chat message CRUD queries with history window"
```

---

## Task 4: System Prompt + Context Builder

**Files:**
- Create: `src/lib/constants/chat-system-prompt.ts`
- Create: `src/lib/chat-context.ts`
- Create: `src/lib/chat-context.test.ts`

- [ ] **Step 1: Write the system prompt constant**

Create `src/lib/constants/chat-system-prompt.ts`:

```typescript
export const CHAT_MODEL = 'claude-sonnet-4-20250514';
export const CHAT_HISTORY_WINDOW = 30;
export const CHAT_MAX_MESSAGE_LENGTH = 4000;

export const CHAT_SYSTEM_PROMPT = `You are Karli's AI assistant for reviewing new client intake forms at All Beauty Hair Studio.

## Who Karli Is
Karli is a hairstylist working out of a Sola salon suite in Wildomar, CA. She works Tuesday through Thursday, 10am-7pm. She charges an hourly rate. Her approach is rooted in intentional design, low-maintenance results, and hair that grows out beautifully -- not hair that constantly asks more of you.

## Your Role
You help Karli think through intake submissions and draft messages to clients. You have access to the client's full intake form data. Karli has already reviewed the intake herself before talking to you.

## How to Communicate
- Be warm, direct, and a little playful -- match Karli's style
- Keep answers focused and scannable
- When analyzing intake data, highlight what matters most for Karli's decision
- When something seems contradictory in the intake (e.g., wants low maintenance but requests a complex service), point it out gently and suggest how Karli might address it

## Drafting Messages
When Karli asks you to draft a message, she will specify the channel:
- **SMS**: Keep it short and casual. Text-style -- no formal greetings, no sign-offs. Emojis are fine if they fit. Think how Karli would actually text a client.
- **Email**: Warmer opening, slightly more structured. Still personal, not corporate. No em dashes. Keep paragraphs short.
- **Both**: Generate both versions, clearly labeled.

Always draft in Karli's voice, not yours. Use "I" as Karli.

## Guardrails
- Never diagnose hair or scalp conditions -- you are not a dermatologist
- Never promise specific results -- every head of hair is different
- Never share information about other clients
- Never recommend specific product brands unless Karli asks you to
- Always defer to Karli's professional judgment -- you assist, she decides
- If you are unsure about something, say so clearly
- Do not add em dashes to any text`;

export const CHAT_GUARDRAIL_MARKERS = [
  'Never diagnose',
  'Never promise specific results',
  'Never share information about other clients',
  'defer to Karli',
];
```

- [ ] **Step 2: Write the context builder**

Create `src/lib/chat-context.ts`:

```typescript
import { CHAT_SYSTEM_PROMPT, CHAT_HISTORY_WINDOW } from './constants/chat-system-prompt';
import { ChatMessageRow } from './queries/chat';

interface IntakeContext {
  clientName: string;
  email: string;
  phone?: string;
  preferredContact?: string;
  hairLoveHate?: string;
  serviceInterest?: string[];
  hairTexture?: string;
  hairLength?: string;
  hairDensity?: string;
  hairCondition?: string[];
  stylingDescription?: string;
  dailyRoutine?: string;
  hairHistory?: string[];
  colorReaction?: string[];
  shampooFrequency?: string;
  whatTheyWant?: string;
  maintenanceFrequency?: string;
  availability?: string[];
  medicalInfo?: string;
  referralSource?: string;
  products?: {
    shampoo?: string;
    conditioner?: string;
    hairSpray?: string;
    dryShampoo?: string;
    heatProtector?: string;
    other?: string;
  };
}

interface SummaryContext {
  overallRating: string;
  readinessScore: number;
  complexityScore: number;
  engagementScore: number;
  flags: Array<{ type: string; label: string }>;
  highlights: string[];
}

/**
 * Format intake data as Q&A pairs for Claude context.
 */
export function formatIntakeForContext(intake: IntakeContext): string {
  const lines: string[] = [
    `## Client: ${intake.clientName}`,
    `Email: ${intake.email}`,
  ];

  if (intake.phone) lines.push(`Phone: ${intake.phone}`);
  if (intake.preferredContact) lines.push(`Preferred contact: ${intake.preferredContact}`);

  lines.push('', '## Intake Responses');

  const qa = (q: string, a: string | undefined | null) => {
    if (a) lines.push(`**${q}:** ${a}`);
  };

  qa('What they love/hate about their hair', intake.hairLoveHate);
  qa('Service interest', intake.serviceInterest?.join(', '));
  qa('Hair texture', intake.hairTexture);
  qa('Hair length', intake.hairLength);
  qa('Hair density/thickness', intake.hairDensity);
  qa('Hair condition', intake.hairCondition?.join(', '));
  qa('Styling self-description', intake.stylingDescription);
  qa('Daily routine', intake.dailyRoutine);
  qa('Hair history (last 2 years)', intake.hairHistory?.join(', '));
  qa('Color reaction history', intake.colorReaction?.join(', '));
  qa('Shampoo frequency', intake.shampooFrequency);
  qa('What they want from their visit', intake.whatTheyWant);
  qa('Maintenance frequency preference', intake.maintenanceFrequency);
  qa('Availability', intake.availability?.join(', '));
  qa('Medical/allergy info', intake.medicalInfo);
  qa('Referral source', intake.referralSource);

  if (intake.products) {
    const p = intake.products;
    const prods = [p.shampoo, p.conditioner, p.hairSpray, p.dryShampoo, p.heatProtector, p.other]
      .filter(Boolean);
    if (prods.length > 0) {
      lines.push('', '**Current products:**');
      if (p.shampoo) lines.push(`- Shampoo: ${p.shampoo}`);
      if (p.conditioner) lines.push(`- Conditioner: ${p.conditioner}`);
      if (p.hairSpray) lines.push(`- Hair Spray: ${p.hairSpray}`);
      if (p.dryShampoo) lines.push(`- Dry Shampoo: ${p.dryShampoo}`);
      if (p.heatProtector) lines.push(`- Heat Protector: ${p.heatProtector}`);
      if (p.other) lines.push(`- Other: ${p.other}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format AI summary scores for context.
 */
export function formatSummaryForContext(summary: SummaryContext): string {
  const lines = [
    '## AI Assessment',
    `Overall: ${summary.overallRating.toUpperCase()}`,
    `Readiness: ${summary.readinessScore}/100 | Complexity: ${summary.complexityScore}/100 | Engagement: ${summary.engagementScore}/100`,
  ];

  if (summary.flags.length > 0) {
    lines.push('', 'Flags:');
    for (const flag of summary.flags) {
      lines.push(`- [${flag.type}] ${flag.label}`);
    }
  }

  if (summary.highlights.length > 0) {
    lines.push('', 'Key highlights:');
    for (const h of summary.highlights) {
      lines.push(`- ${h}`);
    }
  }

  return lines.join('\n');
}

/**
 * Build the messages array for the Claude API call (history + new message only).
 * System prompt is handled separately via buildSystemPrompt().
 */
export function buildChatMessages(
  chatHistory: ChatMessageRow[],
  newMessage: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // Convert history to messages (windowed)
  const windowedHistory = chatHistory.slice(-CHAT_HISTORY_WINDOW);
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = windowedHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add new message
  messages.push({ role: 'user', content: newMessage });

  return messages;
}

/**
 * Format client notes for context.
 */
export function formatNotesForContext(notes: Array<{ content: string; note_type: string; created_at: string }>): string {
  const generalNotes = notes.filter(n => n.note_type !== 'checklist');
  if (generalNotes.length === 0) return '';

  const lines = ['## Stylist Notes'];
  for (const note of generalNotes.slice(0, 10)) {
    lines.push(`- (${note.created_at}) ${note.content}`);
  }
  return lines.join('\n');
}

/**
 * Get the full system prompt with context injected.
 */
export function buildSystemPrompt(
  intake: IntakeContext,
  summary: SummaryContext,
  notes?: Array<{ content: string; note_type: string; created_at: string }>,
  channelContext?: string | null,
): string {
  let systemContext = CHAT_SYSTEM_PROMPT;
  systemContext += '\n\n---\n\n';
  systemContext += formatIntakeForContext(intake);
  systemContext += '\n\n';
  systemContext += formatSummaryForContext(summary);

  if (notes && notes.length > 0) {
    systemContext += '\n\n';
    systemContext += formatNotesForContext(notes);
  }

  if (channelContext) {
    systemContext += `\n\n## Current Request\nKarli is asking you to draft a message. Channel: ${channelContext}. Generate the draft in the appropriate style for this channel.`;
  }

  return systemContext;
}
```

- [ ] **Step 3: Write tests for context builder**

Create `src/lib/chat-context.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  formatIntakeForContext,
  formatSummaryForContext,
  formatNotesForContext,
  buildChatMessages,
  buildSystemPrompt,
} from './chat-context';
import { CHAT_GUARDRAIL_MARKERS, CHAT_SYSTEM_PROMPT } from './constants/chat-system-prompt';

describe('chat system prompt', () => {
  it('contains all required guardrail markers', () => {
    for (const marker of CHAT_GUARDRAIL_MARKERS) {
      expect(CHAT_SYSTEM_PROMPT).toContain(marker);
    }
  });

  it('contains Karli voice markers', () => {
    expect(CHAT_SYSTEM_PROMPT).toContain('warm');
    expect(CHAT_SYSTEM_PROMPT).toContain('Sola salon suite');
    expect(CHAT_SYSTEM_PROMPT).toContain('Tuesday through Thursday');
  });

  it('contains channel-specific instructions', () => {
    expect(CHAT_SYSTEM_PROMPT).toContain('SMS');
    expect(CHAT_SYSTEM_PROMPT).toContain('Email');
    expect(CHAT_SYSTEM_PROMPT).toContain('Both');
  });

  it('does not contain em dashes', () => {
    expect(CHAT_SYSTEM_PROMPT).not.toContain('\u2014');
  });
});

describe('formatIntakeForContext', () => {
  const sampleIntake = {
    clientName: 'Daniela Ocampo',
    email: 'test@example.com',
    phone: '3109840010',
    preferredContact: 'Text',
    hairLoveHate: 'I love the length and color.',
    serviceInterest: ['Other/Not sure yet'],
    hairTexture: 'Medium',
    hairLength: 'Medium',
    hairCondition: ['Heat damage', 'Breakage'],
    whatTheyWant: 'Looking like a spicy hot mommy lol',
    maintenanceFrequency: '6-8 weeks',
  };

  it('formats client name and contact info', () => {
    const result = formatIntakeForContext(sampleIntake);
    expect(result).toContain('Daniela Ocampo');
    expect(result).toContain('test@example.com');
    expect(result).toContain('3109840010');
    expect(result).toContain('Text');
  });

  it('formats Q&A pairs', () => {
    const result = formatIntakeForContext(sampleIntake);
    expect(result).toContain('**What they love/hate about their hair:** I love the length and color.');
    expect(result).toContain('**Hair condition:** Heat damage, Breakage');
    expect(result).toContain('**What they want from their visit:** Looking like a spicy hot mommy lol');
  });

  it('skips undefined fields', () => {
    const result = formatIntakeForContext({
      clientName: 'Test',
      email: 'test@test.com',
    });
    expect(result).not.toContain('Hair texture');
    expect(result).not.toContain('undefined');
  });

  it('formats products section', () => {
    const result = formatIntakeForContext({
      clientName: 'Test',
      email: 'test@test.com',
      products: { shampoo: 'Redken', conditioner: 'Olaplex' },
    });
    expect(result).toContain('Shampoo: Redken');
    expect(result).toContain('Conditioner: Olaplex');
  });
});

describe('formatSummaryForContext', () => {
  it('formats scores and rating', () => {
    const result = formatSummaryForContext({
      overallRating: 'green',
      readinessScore: 85,
      complexityScore: 40,
      engagementScore: 90,
      flags: [{ type: 'GOOD_FIT', label: 'Low maintenance client' }],
      highlights: ['Flexible schedule', 'Open to suggestions'],
    });
    expect(result).toContain('GREEN');
    expect(result).toContain('85/100');
    expect(result).toContain('[GOOD_FIT] Low maintenance client');
    expect(result).toContain('Flexible schedule');
  });
});

describe('buildChatMessages', () => {
  it('builds messages array with new user message', () => {
    const msgs = buildChatMessages([], 'Tell me about this client');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Tell me about this client');
  });

  it('includes chat history before new message', () => {
    const history = [
      { id: 1, client_id: 1, role: 'user' as const, content: 'Hi', channel_context: null, created_at: '2026-03-21' },
      { id: 2, client_id: 1, role: 'assistant' as const, content: 'Hello', channel_context: null, created_at: '2026-03-21' },
    ];
    const msgs = buildChatMessages(history, 'New question');
    expect(msgs).toHaveLength(3);
    expect(msgs[0].content).toBe('Hi');
    expect(msgs[1].content).toBe('Hello');
    expect(msgs[2].content).toBe('New question');
  });

  it('windows history to last 30 messages', () => {
    const history = Array.from({ length: 40 }, (_, i) => ({
      id: i, client_id: 1, role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Msg ${i}`, channel_context: null, created_at: '2026-03-21',
    }));
    const msgs = buildChatMessages(history, 'Latest');
    // 30 from history + 1 new = 31
    expect(msgs).toHaveLength(31);
    expect(msgs[0].content).toBe('Msg 10');
  });
});

describe('formatNotesForContext', () => {
  it('formats general notes, excludes checklist notes', () => {
    const notes = [
      { content: 'Prefers morning appointments', note_type: 'general', created_at: '2026-03-21' },
      { content: '{"stage":"active","item":"consult","completed":true}', note_type: 'checklist', created_at: '2026-03-21' },
    ];
    const result = formatNotesForContext(notes);
    expect(result).toContain('Prefers morning appointments');
    expect(result).not.toContain('checklist');
    expect(result).not.toContain('consult');
  });

  it('returns empty string when no notes', () => {
    expect(formatNotesForContext([])).toBe('');
  });
});

describe('buildSystemPrompt', () => {
  const intake = { clientName: 'Test', email: 'test@test.com' };
  const summary = { overallRating: 'green', readiness: 80, complexity: 30, engagement: 90, flags: [], highlights: [] };

  it('includes system prompt + intake context', () => {
    const prompt = buildSystemPrompt(intake, summary);
    expect(prompt).toContain('Karli');
    expect(prompt).toContain('Test');
    expect(prompt).toContain('test@test.com');
  });

  it('adds channel context for drafting', () => {
    const prompt = buildSystemPrompt(intake, summary, [], 'sms');
    expect(prompt).toContain('Channel: sms');
  });

  it('omits channel context when null', () => {
    const prompt = buildSystemPrompt(intake, summary, [], null);
    expect(prompt).not.toContain('Channel:');
  });

  it('includes client notes when provided', () => {
    const notes = [{ content: 'Sensitive scalp', note_type: 'general', created_at: '2026-03-21' }];
    const prompt = buildSystemPrompt(intake, summary, notes);
    expect(prompt).toContain('Sensitive scalp');
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd /c/kar/abhs && npx vitest run src/lib/chat-context.test.ts
```

Expected: All tests passing.

- [ ] **Step 5: Run full suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: ~290 tests passing.

- [ ] **Step 6: Commit**

```bash
git add abhs/src/lib/constants/chat-system-prompt.ts abhs/src/lib/chat-context.ts abhs/src/lib/chat-context.test.ts
git commit -m "feat: add chat system prompt and context builder with tests"
```

---

## Task 5: Streaming API Route

**Files:**
- Create: `src/app/api/admin/chat/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/admin/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from '@/lib/admin-auth';
import { getClientById } from '@/lib/queries/clients';
import { getIntakeNote } from '@/lib/queries/intake-queue';
import { getNotesByClientId } from '@/lib/queries/notes';
import { getChatMessages, createChatMessage } from '@/lib/queries/chat';
import { parseSalonIntakeNote, assessSalonIntake } from '@/lib/salon-summary';
import { buildSystemPrompt, buildChatMessages } from '@/lib/chat-context';
import type { NoteRow } from '@/lib/queries/notes';
import { CHAT_MODEL, CHAT_MAX_MESSAGE_LENGTH, CHAT_HISTORY_WINDOW } from '@/lib/constants/chat-system-prompt';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  clientId: z.number().int().positive(),
  message: z.string().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
  channelContext: z.enum(['sms', 'email', 'both']).nullable().optional(),
});

/**
 * GET /api/admin/chat?clientId=N
 * Load chat history for a client.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = Number(request.nextUrl.searchParams.get('clientId'));
  if (!clientId || isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const messages = getChatMessages(clientId);
  return NextResponse.json({ messages });
}

/**
 * POST /api/admin/chat
 * Send a message and stream Claude's response.
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI assistant unavailable' }, { status: 500 });
  }

  // Parse and validate request body
  let body;
  try {
    body = ChatRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { clientId, message, channelContext } = body;

  // Load client data
  const client = getClientById(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Load intake note and parse
  const noteContent = getIntakeNote(clientId);
  if (!noteContent) {
    return NextResponse.json({ error: 'No intake data for this client' }, { status: 404 });
  }

  const intake = parseSalonIntakeNote(noteContent);
  const summary = assessSalonIntake(intake, false);

  // Build intake context object
  const intakeContext = {
    clientName: client.q02_client_name || 'Unknown',
    email: client.q03_email || '',
    phone: client.phone || intake.phone,
    preferredContact: client.preferred_contact,
    hairLoveHate: intake.hairLoveHate,
    serviceInterest: intake.serviceInterest,
    hairTexture: intake.hairTexture,
    hairLength: intake.hairLength,
    hairDensity: intake.hairDensity,
    hairCondition: intake.hairCondition,
    stylingDescription: intake.stylingDescription,
    dailyRoutine: intake.dailyRoutine,
    hairHistory: intake.hairHistory,
    colorReaction: intake.colorReaction,
    shampooFrequency: intake.shampooFrequency,
    whatTheyWant: intake.whatTheyWant,
    maintenanceFrequency: intake.maintenanceFrequency,
    availability: intake.availability,
    medicalInfo: intake.medicalInfo,
    referralSource: client.referral_source,
    products: intake.products,
  };

  // Load client notes
  const clientNotes: NoteRow[] = getNotesByClientId(clientId);

  // Load chat history
  const chatHistory = getChatMessages(clientId, CHAT_HISTORY_WINDOW);

  // Save user message
  createChatMessage(clientId, 'user', message, channelContext ?? null);

  // Map SalonSummary scores to plain numbers for context builder
  const summaryContext = {
    overallRating: summary.overallRating,
    readinessScore: summary.readiness.score,
    complexityScore: summary.complexity.score,
    engagementScore: summary.engagement.score,
    flags: summary.flags,
    highlights: summary.highlights,
  };

  // Build messages for Claude
  const systemPrompt = buildSystemPrompt(intakeContext, summaryContext, clientNotes, channelContext);
  const messages = buildChatMessages(chatHistory, message);

  // Stream response
  try {
    const anthropic = new Anthropic({ apiKey });

    const stream = await anthropic.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Save assistant response to DB
          createChatMessage(clientId, 'assistant', fullResponse, channelContext ?? null);

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Chat stream error:', error);

          // Save partial response if we have one
          if (fullResponse) {
            createChatMessage(clientId, 'assistant', fullResponse + '\n\n[Response interrupted]', channelContext ?? null);
          }

          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ error: 'Response interrupted -- try again' })}\n\n`
          ));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Something went wrong, try again' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify no serverExternalPackages needed**

The Anthropic SDK is pure JS (no native bindings like better-sqlite3), so it does NOT need `serverExternalPackages`. No change to `next.config.ts` needed. If the build fails with bundling errors related to the SDK, add `'@anthropic-ai/sdk'` to the array as a fallback.

- [ ] **Step 3: Verify build succeeds**

```bash
cd /c/kar/abhs && npx next build
```

Expected: Build passes with no TypeScript errors related to the new route.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/api/admin/chat/route.ts
git commit -m "feat: add streaming chat API route with Claude integration"
```

---

## Task 6: Chat UI Components

**Files:**
- Create: `src/components/salon/chat-message.tsx`
- Create: `src/components/salon/intake-chat-panel.tsx`

- [ ] **Step 1: Create ChatMessage component**

Create `src/components/salon/chat-message.tsx`:

```typescript
'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  channelContext?: string | null;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, channelContext, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = role === 'user';

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-warm-600 text-white rounded-br-md'
            : 'bg-blush-50 text-warm-800 border border-warm-100 rounded-bl-md'
        }`}
      >
        {channelContext && !isUser && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-warm-400 font-medium uppercase tracking-wide">
            {channelContext === 'both' ? 'SMS + Email Draft' : `${channelContext} Draft`}
          </div>
        )}
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-warm-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
        {!isUser && content && !isStreaming && (
          <button
            onClick={handleCopy}
            className="mt-2 inline-flex items-center gap-1 text-xs text-warm-400 hover:text-warm-600 transition-colors"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create IntakeChatPanel component**

Create `src/components/salon/intake-chat-panel.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './chat-message';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  channel_context?: string | null;
  created_at?: string;
}

interface IntakeChatPanelProps {
  clientId: number;
  clientName: string;
}

export function IntakeChatPanel({ clientId, clientName }: IntakeChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [channelContext, setChannelContext] = useState<'sms' | 'email' | 'both' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, clientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function loadHistory() {
    try {
      const res = await fetch(`/api/admin/chat?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Silent fail -- empty chat is fine
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI immediately
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      channel_context: isDraftMode ? channelContext : null,
    };
    setMessages(prev => [...prev, userMsg]);

    // Start streaming
    setIsLoading(true);
    setIsStreaming(true);

    // Add empty assistant message that will be filled by stream
    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      channel_context: isDraftMode ? channelContext : null,
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          message: userMessage,
          channelContext: isDraftMode ? channelContext : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.done) break;
            if (data.error) {
              setError(data.error);
              break;
            }
            if (data.text) {
              fullText += data.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      // Remove empty assistant message on error
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1]?.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-forest-600 text-white rounded-full shadow-lg hover:bg-forest-700 transition-colors md:bottom-6"
        aria-label="Open AI chat assistant"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium hidden sm:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <>
      {/* Mobile: full screen overlay */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-100 bg-blush-50/60">
          <button onClick={() => setIsOpen(false)} className="p-1" aria-label="Close chat">
            <ArrowLeft size={20} className="text-warm-600" />
          </button>
          <div>
            <p className="text-sm font-semibold text-warm-800">{clientName}</p>
            <p className="text-xs text-warm-400">AI Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-warm-400 mt-8">
              Ask me anything about this intake, or toggle Draft Mode to write a message to your client.
            </p>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              channelContext={msg.channel_context}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          {error && (
            <div className="text-center text-sm text-red-500 py-2">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <ChatInput
          input={input}
          setInput={setInput}
          isDraftMode={isDraftMode}
          setIsDraftMode={setIsDraftMode}
          channelContext={channelContext}
          setChannelContext={setChannelContext}
          isLoading={isLoading}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      </div>

      {/* Desktop: side panel */}
      <div className="hidden md:flex md:fixed md:right-0 md:top-0 md:bottom-0 md:w-[40%] md:max-w-[480px] md:min-w-[360px] md:z-50 md:flex-col md:border-l md:border-warm-200 md:bg-white md:shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100 bg-blush-50/60">
          <div>
            <p className="text-sm font-semibold text-warm-800">{clientName}</p>
            <p className="text-xs text-warm-400">AI Assistant</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors" aria-label="Close chat">
            <X size={18} className="text-warm-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-warm-400 mt-8">
              Ask me anything about this intake, or toggle Draft Mode to write a message to your client.
            </p>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              channelContext={msg.channel_context}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          {error && (
            <div className="text-center text-sm text-red-500 py-2">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <ChatInput
          input={input}
          setInput={setInput}
          isDraftMode={isDraftMode}
          setIsDraftMode={setIsDraftMode}
          channelContext={channelContext}
          setChannelContext={setChannelContext}
          isLoading={isLoading}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
        />
      </div>
    </>
  );
}

/** Shared input area for both mobile and desktop layouts */
function ChatInput({
  input,
  setInput,
  isDraftMode,
  setIsDraftMode,
  channelContext,
  setChannelContext,
  isLoading,
  onSend,
  onKeyDown,
  inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  isDraftMode: boolean;
  setIsDraftMode: (v: boolean) => void;
  channelContext: 'sms' | 'email' | 'both' | null;
  setChannelContext: (v: 'sms' | 'email' | 'both' | null) => void;
  isLoading: boolean;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className="border-t border-warm-100 bg-white px-4 py-3 space-y-2 safe-area-bottom">
      {/* Draft mode toggle + channel pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setIsDraftMode(!isDraftMode);
            if (!isDraftMode && !channelContext) setChannelContext('sms');
          }}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            isDraftMode
              ? 'bg-forest-50 text-forest-700 border-forest-200'
              : 'text-warm-400 border-warm-200 hover:border-warm-300'
          }`}
        >
          Draft Message
        </button>
        {isDraftMode && (
          <div className="flex gap-1">
            {(['sms', 'email', 'both'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChannelContext(ch)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  channelContext === ch
                    ? 'bg-warm-600 text-white border-warm-600'
                    : 'text-warm-500 border-warm-200 hover:border-warm-300'
                }`}
              >
                {ch === 'both' ? 'Both' : ch.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text input + send */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isDraftMode ? `What should the ${channelContext || 'message'} say?` : 'Ask about this intake...'}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-warm-200 bg-warm-50/50 px-3 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-300"
          disabled={isLoading}
        />
        <Button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-10 w-10 rounded-xl bg-forest-600 hover:bg-forest-700 text-white shrink-0"
          aria-label="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /c/kar/abhs && npx next build
```

Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/components/salon/chat-message.tsx abhs/src/components/salon/intake-chat-panel.tsx
git commit -m "feat: add chat UI components (panel, message bubbles, draft mode)"
```

---

## Task 7: Integrate Chat Panel Into Intake Detail Page

**Files:**
- Modify: `src/app/admin/(dashboard)/intake/[id]/page.tsx`

- [ ] **Step 1: Add import**

At the top of the file, add:

```typescript
import { IntakeChatPanel } from '@/components/salon/intake-chat-panel';
```

- [ ] **Step 2: Add chat panel component**

Just before the closing `</div>` of the return statement (line 205), add the `IntakeChatPanel`:

```typescript
      {/* AI Chat Assistant */}
      <IntakeChatPanel clientId={numId} clientName={client.q02_client_name || 'Client'} />

      {/* Sticky Decision Bar */}
      {isReviewable && <IntakeDecisionBar clientId={numId} clientName={client.q02_client_name} />}
    </div>
```

Note: The chat panel renders on ALL intake statuses (not just reviewable), since Karli may want to revisit accepted or declined intakes too.

- [ ] **Step 3: Start dev server and test manually**

```bash
cd /c/kar/abhs && npx next dev -p 3005
```

Test at `http://localhost:3005/admin/intake/[id]`:
1. Chat button appears in bottom-right corner
2. Clicking opens side panel (desktop) or full screen (mobile)
3. Empty state shows helpful placeholder text
4. Draft mode toggle shows channel pills
5. Messages send and stream back
6. Copy button works on assistant messages
7. Panel closes cleanly

- [ ] **Step 4: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All tests passing.

- [ ] **Step 5: Commit**

```bash
git add abhs/src/app/admin/(dashboard)/intake/[id]/page.tsx
git commit -m "feat: integrate AI chat panel into intake detail page"
```

---

## Task 8: Final Polish + Verification

- [ ] **Step 1: Run full test suite**

```bash
cd /c/kar/abhs && npx vitest run
```

Expected: All tests passing.

- [ ] **Step 2: Run production build**

```bash
cd /c/kar/abhs && npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Visual verify on dev server**

```bash
cd /c/kar/abhs && npx next dev -p 3005
```

Check:
- Desktop: side panel at 40% width, intake visible alongside
- Mobile (use browser dev tools): full-screen chat with back arrow
- Streaming tokens appear in real time
- Chat bubbles use ABHS brand colors (warm copper/blush for Karli, cream for Claude)
- Draft mode: channel pills work, drafts are labeled
- Copy button: clipboard works, shows checkmark feedback
- Chat history persists after closing/reopening panel
- Safe area padding on iPhone (if testable)

- [ ] **Step 4: Commit any polish fixes**

```bash
git add -A && git commit -m "fix: polish chat UI styling and interactions"
```

(Only if changes were needed.)

- [ ] **Step 5: Update project map**

Update `~/.claude/docs/projectmap/abhs.md`:
- Add `@anthropic-ai/sdk` to Dependencies
- Add `ANTHROPIC_API_KEY` to Environment Variables
- Add `/api/admin/chat` routes to API Routes
- Add `chat_messages` to Database Schema
- Update Test Coverage section
- Add Claude API to External Integrations

- [ ] **Step 6: Update handoff.md**

Mark AI chat as complete, add to build history, update next session priorities.

- [ ] **Step 7: Final commit**

```bash
git add -A && git commit -m "docs: update project map and handoff for AI chat feature"
```
