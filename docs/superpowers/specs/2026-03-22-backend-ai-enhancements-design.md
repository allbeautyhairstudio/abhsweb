# Spec B: Backend & AI Enhancements

**Date:** 2026-03-22
**Status:** Approved
**Origin:** Karli Rosario's Website Strategy & Development Master List
**Scope:** EXIF auto-orientation on photo uploads, AI chat panel enhancements (Stylist Notes, Draft Response, Karli's voice guardrails)

---

## 1. EXIF Auto-Orientation Fix

### Problem

Phone cameras (especially iPhones) store rotation in EXIF metadata instead of physically rotating pixels. The current sharp pipeline converts to WebP without reading EXIF orientation, so photos can display sideways or upside-down in the admin intake detail page.

### Current Code

```typescript
// src/app/api/intake/upload/route.ts
const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
```

### Proposed Fix

```typescript
const webpBuffer = await sharp(buffer).rotate().webp({ quality: 80 }).toBuffer();
```

Sharp's `.rotate()` with no arguments:
- Reads EXIF orientation tag automatically
- Applies the correct rotation to physically orient the pixels
- Works for all common orientations (90, 180, 270 degrees, mirrored variants)
- No-op if no EXIF orientation data present (safe for already-correct images)

Sharp strips EXIF metadata from WebP output by default -- no privacy/metadata leak.

### Scope

- Applies to both selfie and inspiration photo processing in the upload route
- **New uploads only.** Already-uploaded photos are not retroactively fixed.
- No new dependencies required (sharp already installed at v0.34.5)

### Testing

- Add test verifying that the upload pipeline includes `.rotate()` in the sharp chain
- Test with: images that have EXIF orientation metadata, images without EXIF, already-rotated images

### Files Affected

- `src/app/api/intake/upload/route.ts` (add `.rotate()` to both selfie and inspiration processing)

---

## 2. AI Chat Panel Enhancements

### Current State

Streaming Claude Sonnet chat on admin intake detail page (`/admin/intake/[id]`). Karli can:
- Ask questions about the client's intake data
- Request draft messages in SMS, Email, or Both format
- Channel selector toggles tone (SMS casual, Email structured)
- Chat history persists in SQLite (`chat_messages` table)
- Last 30 messages sent to Claude for context

### What Karli Described

"Stylist Notes" input field for raw thoughts/technical assessments + "Generate Response" button that merges client data and stylist notes into a professional draft + "Review & Send" functionality.

### Proposed Enhancements

#### 2a. Stylist Notes Field

**UI:**
- Collapsible text area at the top of the chat panel (above message history)
- Label: "Stylist Notes"
- Placeholder: "Your technical assessment, observations, recommendations..."
- Collapse/expand toggle so it doesn't eat screen space when not in use
- On mobile (full-screen chat), starts collapsed

**Persistence:**
- Store in `client_notes` table with type `stylist_assessment` (reuses existing notes infrastructure)
- New `upsertStylistNote()` function in notes queries -- creates if none exists, updates if one does
- One stylist notes entry per client (upsert, not append)
- Auto-saves on blur with visual indicator (subtle "Saved" / "Saving..." / "Error" text)
- Loaded when chat panel opens

**AI Context:**
- Stylist notes are included in the system prompt context sent to Claude
- Positioned after intake data, before conversation history
- Format: "Karli's Stylist Notes: {content}"
- `formatNotesForContext()` in `chat-context.ts` updated to EXCLUDE `stylist_assessment` type from the general notes section (prevents duplication -- stylist notes get their own dedicated section in the prompt)
- When Karli asks for a draft, Claude already knows her technical read

#### 2b. Quick Action: "Draft Response" Button

**UI:**
- Button in the chat panel action area, next to the channel selector
- Label: "Draft Response" with a pen/edit icon
- Disabled when: no channel selected, streaming in progress, or chat history loading

**Behavior:**
- Sends a pre-built prompt to Claude: "Based on this client's intake and my stylist notes, draft a warm, professional response I can send to them."
- Respects the current channel selection (SMS/Email/Both)
- Claude responds with a formatted draft
- No typing required from Karli -- one tap

**Prompt template:**
```
Draft a {channel} response to {client_name} based on their intake submission and my stylist notes.
Keep it warm, professional, and in my voice.
{If SMS: Keep it casual and concise, like texting a friend.}
{If Email: Use a clear subject line, greeting, body, and sign-off. Still personal, not corporate.}
{If Both: Draft both versions.}
```

#### 2c. Draft Preview Card

**Detection:** A message is a draft when its `channel_context` column in `chat_messages` is non-null (SMS/Email/Both). The "Draft Response" button sets `channel_context` on the user message, and the assistant response inherits it. Regular chat messages have `channel_context = null`.

**UI:**
- When Claude generates a draft (detected by `channel_context` on the message), it renders in a visually distinct card (not just a chat bubble)
- Card has a subtle border/background to distinguish from regular chat messages
- "Copy to Clipboard" button on the card with "Copied!" feedback
- Channel indicator badge (SMS/Email/Both) visible on the card

**Behavior:**
- Karli reviews the draft in the card
- Copies it with one tap
- Pastes into her email client or Messages app
- Not "send from the website" -- direct send is a future feature requiring verified Twilio + SMTP for customer-facing messages

### Karli's Voice Profile (Draft Mode)

The system prompt for draft mode includes explicit voice guardrails:

**Karli sounds like:**
- Warm and personal -- uses client's first name, feels like a friend who happens to be a professional
- Confident but not pushy -- she knows her craft, no hard sells
- Honest and direct -- doesn't over-promise or use filler
- Capacity-aware -- acknowledges scheduling realities without apologizing
- Cut-forward -- when discussing services, cutting expertise leads

**Karli does NOT sound like:**
- Corporate ("We appreciate your business", "At your earliest convenience")
- Templated ("Dear valued client", "Thank you for your inquiry")
- Pushy ("Don't miss out", "Limited availability")
- Apologetic about her schedule

**SMS tone:** Casual, shorter, like texting a friend.
- Example: "Hey Sarah! Loved looking through your intake -- your hair has so much potential. I'd love to get you in for a consultation so we can talk through what you're envisioning. I have some openings next week if you're free!"

**Email tone:** Same warmth, more structure. Subject line + greeting + body + sign-off. Still sounds like a person, not a business.
- Example subject: "Your consultation with All Beauty Hair Studio"
- Example opening: "Hi Sarah, thank you so much for filling out the new client form..."

**Hard rules:**
- Always use client's pronouns from intake (if provided). `IntakeContext` must include a `pronouns` field, and `formatIntakeForContext()` must surface it prominently.
- No em dashes
- No mention of AI involvement
- No health/disability references
- Positive framing always

### Files Affected

- `src/components/salon/intake-chat-panel.tsx` (Stylist Notes field, Draft Response button, draft card UI)
- `src/components/salon/chat-message.tsx` (draft card rendering for messages with `channel_context`)
- `src/lib/chat-context.ts` (include stylist notes in system prompt, exclude `stylist_assessment` from general notes, add pronouns to `IntakeContext`)
- `src/lib/chat-system-prompt.ts` (voice profile guardrails for draft mode)
- `src/lib/queries/notes.ts` (new `upsertStylistNote()` function)
- `src/app/api/admin/chat/route.ts` (fetch stylist note and pass to context builder)

### Testing

- Stylist notes persistence (create, read, upsert)
- Stylist notes included in AI context, excluded from general notes section
- Draft Response prompt generation for each channel (SMS, Email, Both)
- Voice guardrails present in system prompt
- Pronouns included in intake context
- Draft detection by `channel_context` field
- Auto-save indicator states (saving, saved, error)

---

## Out of Scope

- Direct send from website (future -- requires verified Twilio + customer-facing SMTP)
- Retroactive EXIF fix for existing uploads
- Changes to public-facing pages (Spec A)
- Service description changes (Spec C)

---

## Success Criteria

1. New photo uploads are automatically oriented correctly regardless of EXIF metadata
2. Stylist Notes field visible in chat panel, persists per client, auto-saves with visual indicator
3. "Draft Response" button generates a channel-appropriate draft with one tap
4. Draft renders in a distinct card (detected by `channel_context`) with copy-to-clipboard
5. All drafts sound like Karli -- warm, personal, professional, positive
6. Voice guardrails in system prompt enforce: no em dashes, no AI disclosure, pronoun usage, positive framing
7. All existing tests pass
8. New tests cover EXIF rotation, stylist notes CRUD, draft prompt generation, voice guardrails, pronoun context
9. Build succeeds
