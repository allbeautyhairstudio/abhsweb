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

  it('includes pronouns when provided', () => {
    const result = formatIntakeForContext({
      clientName: 'Alex',
      email: 'alex@test.com',
      pronouns: 'they/them',
    });
    expect(result).toContain('Pronouns: they/them');
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

  it('excludes stylist_assessment notes (prevents duplication)', () => {
    const notes = [
      { content: 'General note here', note_type: 'general', created_at: '2026-03-21' },
      { content: 'Fine hair, level 7 base', note_type: 'stylist_assessment', created_at: '2026-03-21' },
    ];
    const result = formatNotesForContext(notes);
    expect(result).toContain('General note here');
    expect(result).not.toContain('Fine hair, level 7 base');
  });

  it('returns empty string when no notes', () => {
    expect(formatNotesForContext([])).toBe('');
  });
});

describe('buildSystemPrompt', () => {
  const intake = { clientName: 'Test', email: 'test@test.com' };
  const summary = { overallRating: 'green', readinessScore: 80, complexityScore: 30, engagementScore: 90, flags: [], highlights: [] };

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

  it('includes stylist notes under dedicated heading when provided', () => {
    const prompt = buildSystemPrompt(intake, summary, [], null, 'Fine hair, level 7 base, needs gentle processing');
    expect(prompt).toContain("## Karli's Stylist Notes");
    expect(prompt).toContain('Fine hair, level 7 base, needs gentle processing');
  });

  it('omits stylist notes heading when not provided', () => {
    const prompt = buildSystemPrompt(intake, summary, []);
    expect(prompt).not.toContain("Karli's Stylist Notes");
  });
});
