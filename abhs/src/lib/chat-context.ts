import { CHAT_SYSTEM_PROMPT, CHAT_HISTORY_WINDOW } from './constants/chat-system-prompt';
import { ChatMessageRow } from './queries/chat';

export interface IntakeContext {
  clientName: string;
  email: string;
  phone?: string | null;
  pronouns?: string | null;
  preferredContact?: string | null;
  hairLoveHate?: string | null;
  serviceInterest?: string[];
  hairTexture?: string | null;
  hairLength?: string | null;
  hairDensity?: string | null;
  hairCondition?: string[];
  stylingDescription?: string | null;
  dailyRoutine?: string | null;
  hairHistory?: string[];
  colorReaction?: string[];
  shampooFrequency?: string | null;
  whatTheyWant?: string | null;
  maintenanceFrequency?: string | null;
  availability?: string[];
  medicalInfo?: string | null;
  referralSource?: string | null;
  products?: {
    shampoo?: string | null;
    conditioner?: string | null;
    hairSpray?: string | null;
    dryShampoo?: string | null;
    heatProtector?: string | null;
    other?: string | null;
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
  if (intake.pronouns) lines.push(`Pronouns: ${intake.pronouns}`);
  if (intake.preferredContact) lines.push(`Preferred contact: ${intake.preferredContact}`);

  lines.push('', '## Consultation Responses');

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
  const windowedHistory = chatHistory.slice(-CHAT_HISTORY_WINDOW);
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = windowedHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  messages.push({ role: 'user', content: newMessage });

  return messages;
}

/**
 * Format client notes for context.
 */
export function formatNotesForContext(notes: Array<{ content: string; note_type: string; created_at: string }>): string {
  const generalNotes = notes.filter(n => n.note_type !== 'checklist' && n.note_type !== 'stylist_assessment');
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
  stylistNotes?: string | null,
): string {
  let systemContext = CHAT_SYSTEM_PROMPT;
  systemContext += '\n\n---\n\n';
  systemContext += formatIntakeForContext(intake);
  systemContext += '\n\n';
  systemContext += formatSummaryForContext(summary);

  if (stylistNotes) {
    systemContext += `\n\n## Karli's Stylist Notes\n${stylistNotes}`;
  }

  if (notes && notes.length > 0) {
    systemContext += '\n\n';
    systemContext += formatNotesForContext(notes);
  }

  if (channelContext) {
    systemContext += `\n\n## Current Request\nKarli is asking you to draft a message. Channel: ${channelContext}. Generate the draft in the appropriate style for this channel.`;
  }

  return systemContext;
}
