# Design Spec: AI Chat for Intake Review

> **Date:** 2026-03-21 (Session 3)
> **Status:** Approved
> **Scope:** Streaming AI chat panel on admin intake detail page

---

## Overview

Add a Claude-powered chat assistant to the admin intake detail page (`/admin/intake/[id]`). Karli reviews the intake herself first, then uses the AI to ask questions about the client's intake data and draft messages to clients when she needs more information or wants to communicate.

**Core use cases:**
1. Think-through mode -- Karli asks questions about intake answers (e.g., "She said low maintenance but wants balayage -- is that realistic?")
2. Draft mode -- Karli selects a channel (SMS, email, or both) and asks Claude to draft a message in her voice

**What this is NOT:**
- Not auto-generated summaries (the existing AI scoring engine handles that)
- Not a client-facing chatbot
- Not a replacement for Karli's judgment -- she reviews first, AI assists second

---

## Architecture

### Data Flow

1. Karli opens `/admin/intake/[id]` and reviews the intake
2. She clicks a chat button in the sticky action bar
3. Side panel opens (desktop) or full screen (mobile)
4. Panel loads any previous chat history for this client from SQLite
5. Karli types a question or selects "Draft a message" mode with channel selector
6. Browser sends POST to `/api/admin/chat` with message + client ID + optional channel context
7. API route loads client's full intake data, injects as Claude system context
8. Claude Sonnet streams the response back via SSE
9. Both messages (user + assistant) saved to `chat_messages` table
10. Karli can copy any response via copy button

### New Pieces

| What | Where | Purpose |
|------|-------|---------|
| `chat_messages` table | SQLite (same DB) | Persistent chat history per client |
| `POST /api/admin/chat` | `src/app/api/admin/chat/route.ts` | SSE streaming endpoint, admin auth |
| `IntakeChatPanel` | `src/components/salon/intake-chat-panel.tsx` | Side panel (desktop) / full screen (mobile) |
| `ChatMessage` | `src/components/salon/chat-message.tsx` | Individual message bubble |
| `DraftMessageForm` | `src/components/salon/draft-message-form.tsx` | Channel selector (SMS/email/both) |
| System prompt | `src/lib/constants/chat-system-prompt.ts` | Karli's voice, salon context, guardrails |
| Chat queries | `src/lib/queries/chat.ts` | DB operations for chat_messages |
| Anthropic SDK | `@anthropic-ai/sdk` (new dependency) | Claude API client |

### Auth

Same admin auth as all other admin routes. `isAuthenticated()` check on the API route.

### Context Injection

Every API call sends the client ID. The route dynamically builds context:
- Static system prompt (Karli's voice + rules)
- Client's full intake data (all q-columns, formatted as Q&A pairs matching the intake form structure)
- AI summary scores + flags + highlights
- Existing client notes
- Channel selection context if drafting

Claude always knows everything about the client without Karli having to explain.

---

## Layout & UX

### Desktop (768px+)

- Intake detail page on the left (~60% width)
- Chat panel slides in from the right (~40% width)
- Chat button in the sticky action bar at the bottom (next to Accept/Decline)
- Panel can be collapsed back to full-width intake view
- Fixed split -- no resizing

### Mobile (<768px)

- Chat button in the sticky bottom bar
- Opens a full-screen chat view with back arrow to return to intake
- Intake data not visible while chatting -- but Claude has full context
- One thing at a time, done well. No cramming two dense panels on a small screen.

### Chat Panel Layout (Both Breakpoints)

- **Header:** client name + "AI Assistant" label + close/back button
- **Message area:** scrollable, newest at bottom
  - Karli's messages: right-aligned, warm copper/blush bubble
  - Claude's messages: left-aligned, cream/white bubble, forest accent
  - Streaming indicator while tokens arrive
- **Bottom:** text input + send button
- **Draft mode:** channel selector pills (SMS | Email | Both) appear above input when drafting
  - Default mode is plain conversation -- no channel pills
  - Each generated draft has a **copy button** (one tap, clipboard)

### Draft Message Flow

1. Karli taps "Draft Message" toggle (explicit entry point -- if she asks Claude to draft without toggling, Claude responds conversationally without channel-specific formatting, which is fine)
2. Channel pills appear: SMS | Email | Both
3. She selects channel(s) and describes what she wants to communicate
4. Claude generates draft(s) tailored to the channel:
   - **SMS:** Short, casual, conversational. Karli's texting voice.
   - **Email:** Warmer, slightly more structured. Still Karli, not corporate.
   - **Both:** Two separate drafts side by side, each tailored.
5. Each draft has a copy button. Karli pastes into her messages app or Gmail.

### Brand Styling

- Matches existing warm ABHS admin palette (blush, cream, forest, copper)
- Chat bubbles use brand colors, not generic gray/blue
- Consistent with the polished intake detail page from Session 2

---

## Data & Storage

### New Table: `chat_messages`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | INTEGER PRIMARY KEY | Auto-increment |
| `client_id` | INTEGER | Links to `clients` table |
| `role` | TEXT | `user` or `assistant` |
| `content` | TEXT | Message text |
| `channel_context` | TEXT NULL | `sms`, `email`, `both`, or null (plain conversation) |
| `created_at` | TEXT | ISO timestamp |

No foreign key constraint -- same pattern as `client_notes`. Client deletion must cascade: add `DELETE FROM chat_messages WHERE client_id = ?` to both `deleteClient()` and `deleteClients()` in `src/lib/queries/clients.ts`. (Note: `client_notes` has the same gap -- fix both while we're here.)

### Chat History

- Persistent per client -- Karli comes back days later and her conversation is still there
- **History window:** Only send the last 30 messages to Claude (configurable constant). Older messages stay in the DB but aren't included in API calls. Prevents unbounded token growth over weeks/months.
- History loaded on panel open, scrolled to bottom

### System Prompt

Stored as code in `src/lib/constants/chat-system-prompt.ts`. Contains:

**Voice:**
- Warm, direct, a little playful -- matches Karli's real communication style
- Examples drawn from her intake form copy, site content, and real interactions
- Neurodivergent-aware (capacity, executive function, gentle follow-ups)

**Salon context:**
- Sola suite, Wildomar CA
- Tuesday-Thursday, 10am-7pm
- Hourly rate
- Intentional design, low-maintenance results, grows out beautifully
- Consultation required for most color services

**Channel instructions:**
- SMS: Keep it short, casual, text-style. No formal greetings. Emojis OK if Karli uses them.
- Email: Warmer opening, slightly more structured. Still personal, not corporate. No em dashes.

**Guardrails:**
- Never diagnose hair or scalp conditions
- Never promise specific results
- Never share other clients' information
- Never recommend products by brand unless Karli specifically asks
- Always defer to Karli's professional judgment
- If unsure, say so

---

## API Route: POST /api/admin/chat

### Request

```typescript
{
  clientId: number
  message: string
  channelContext?: 'sms' | 'email' | 'both' | null
}
```

### Flow

1. `isAuthenticated()` check
2. Validate request body (Zod) -- `message` max 4000 chars
3. Load client record (full intake data, all q-columns)
4. Load AI summary scores + flags
5. Load existing client notes
6. Load chat history for this client (last 30 messages)
7. Build messages array: system prompt + context + history + new user message
8. Save Karli's message to `chat_messages`
9. Call Anthropic SDK (Claude Sonnet) with streaming enabled
10. Stream response back via SSE (`ReadableStream`)
11. On stream complete, save Claude's full response to `chat_messages`

### Streaming

Uses Next.js App Router `ReadableStream` response with `text/event-stream` content type. The Anthropic SDK's streaming API emits text deltas that get forwarded to the browser as SSE events. On the client side, an `EventSource` or `fetch` with `ReadableStream` reader consumes the stream.

### Error Handling

- API key missing: 500 with "AI assistant unavailable"
- Claude API error: 500, log server-side, show "Something went wrong, try again" in chat
- Auth failure: 401, same as other admin routes
- Mid-stream disconnect: save whatever was received, show it with an error indicator ("Response interrupted -- try again"), let Karli retry
- Invalid client ID: 404
- No client-side rate limiting -- Anthropic's API limits are sufficient for this volume

### Environment

| Variable | Value | Notes |
|----------|-------|-------|
| `ANTHROPIC_API_KEY` | (in .env.local) | Server-side only, never exposed to browser |

### Dependency

| Package             | Version        | Purpose                               |
|---------------------|----------------|---------------------------------------|
| `@anthropic-ai/sdk` | pin at install | Official Anthropic SDK for Claude API |

### Model

Claude Sonnet (`claude-sonnet-4-20250514`) -- stored as a constant in the codebase for easy updates. Best balance of drafting quality, streaming speed, and cost for this use case. At ~40 clients/month, estimated cost is $3-5/month.

---

## Testing

### Unit Tests

| Test | File | What |
|------|------|------|
| System prompt guardrails | `chat-system-prompt.test.ts` | Verify prompt includes required guardrails and voice markers |
| Context builder | `chat.test.ts` | Verify intake data formats correctly as Q&A pairs |
| Chat message CRUD | `chat.test.ts` | Save, load, delete operations on `chat_messages` |
| Channel-specific prompting | `chat.test.ts` | System prompt adjusts for SMS vs email vs both |

### Not Testing

- Component rendering (consistent with current coverage level -- 6 component tests)
- Actual Claude API calls (would require mocking the SDK, low value)
- Streaming mechanics (infrastructure, not business logic)

---

## Security

- `ANTHROPIC_API_KEY` server-side only
- Admin auth required (`isAuthenticated()`)
- Client data stays server-side as context -- browser only sees what's already on the intake page
- System prompt guardrails prevent inappropriate AI behavior
- Input sanitization on Karli's messages before sending to Claude
- AI Disclosure: existing `/legal/ai-disclosure` page covers admin AI use
- Chat panel header shows "AI Assistant" label -- transparent about AI involvement

---

## Separate Tasks (Not In This Spec)

These were identified during brainstorming and will get their own spec cycles:

1. **Intake output formatting** -- Generate a Wix-style formatted consultation form (Q&A layout with photos). Karli wants the intake output to look like her old Wix form PDF. No QR code needed.
2. **PostgreSQL migration** -- Migrate ABHS from SQLite to PostgreSQL (already running on VPS). Touches every query, schema, db.ts, deploy script.

---

## Success Criteria

- Karli can open a chat panel on any intake detail page
- Chat streams responses in real time (no spinner wait)
- Karli can ask questions about the intake and get contextual answers
- Karli can select SMS/email/both and get channel-appropriate draft messages
- Draft messages sound like Karli, not like AI
- Chat history persists across sessions
- Works well on both desktop and mobile
- No new security concerns
