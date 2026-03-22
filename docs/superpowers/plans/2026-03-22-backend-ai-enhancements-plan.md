# Backend & AI Enhancements -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix EXIF auto-orientation on photo uploads and enhance the AI chat panel with Stylist Notes, Draft Response button, and Karli's voice profile guardrails.

**Architecture:** EXIF fix is a one-line addition to the existing sharp pipeline. Chat enhancements add a stylist notes field (persisted in existing `client_notes` table), a quick-action Draft Response button, and draft preview cards with copy-to-clipboard. Voice profile guardrails baked into the chat system prompt.

**Tech Stack:** Next.js 16, TypeScript, sharp (v0.34.5), Anthropic SDK (@anthropic-ai/sdk), SQLite (better-sqlite3), Vitest

**Spec:** `docs/superpowers/specs/2026-03-22-backend-ai-enhancements-design.md`

---

## Task 1: EXIF Auto-Orientation Fix

**Files:**
- Modify: `src/app/api/intake/upload/route.ts`

- [ ] **Step 1: Read upload route**

Read `src/app/api/intake/upload/route.ts` fully. Find the two sharp processing pipelines (selfies and inspiration photos).

- [ ] **Step 2: Add .rotate() to selfie processing**

Find the selfie processing line (approximately):
```typescript
const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
```

Change to:
```typescript
const webpBuffer = await sharp(buffer).rotate().webp({ quality: 80 }).toBuffer();
```

- [ ] **Step 3: Add .rotate() to inspiration photo processing**

Find the inspiration photo processing line (same pattern). Add `.rotate()` the same way.

- [ ] **Step 4: Verify both .rotate() calls are in place**

Search the file to confirm both selfie and inspiration processing pipelines include `.rotate()`:

```bash
cd c:\kar\abhs && grep -n "\.rotate()" src/app/api/intake/upload/route.ts
```

Expected: 2 matches (one for selfies, one for inspiration).

- [ ] **Step 5: Run tests**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: All 292 tests pass (no test changes, just verifying no regressions).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/intake/upload/route.ts
git commit -m "fix: auto-orient photos from EXIF metadata on upload"
```

---

## Task 2: Stylist Notes -- Database & Queries

**Files:**
- Modify: `src/lib/queries/notes.ts`
- Create: `src/lib/queries/stylist-notes.test.ts`

- [ ] **Step 1: Write stylist notes query tests**

Create `src/lib/queries/stylist-notes.test.ts`:

```typescript
// Test: upsertStylistNote creates a new note when none exists
// Test: upsertStylistNote updates existing note (not duplicates)
// Test: getStylistNote returns null when no note exists
// Test: getStylistNote returns the note content when exists
// Test: note has type 'stylist_assessment'
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd c:\kar\abhs && npx vitest run src/lib/queries/stylist-notes.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement stylist notes queries**

Read `src/lib/queries/notes.ts` first to understand existing patterns.

Add to `src/lib/queries/notes.ts` (or create a separate file if cleaner):

```typescript
export function getStylistNote(clientId: number): string | null
export function upsertStylistNote(clientId: number, content: string): void
```

Implementation uses `client_notes` table with `type = 'stylist_assessment'`. Upsert: check if exists, update if so, insert if not.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd c:\kar\abhs && npx vitest run src/lib/queries/stylist-notes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries/notes.ts src/lib/queries/stylist-notes.test.ts
git commit -m "feat: add stylist notes upsert queries"
```

---

## Task 3: Stylist Notes -- Chat Context Integration

**Files:**
- Modify: `src/lib/chat-context.ts`
- Modify: `src/lib/chat-context.test.ts`

- [ ] **Step 1: Write context integration tests**

Add tests to `src/lib/chat-context.test.ts`:
- Test: stylist notes appear in system prompt under "Karli's Stylist Notes:" heading
- Test: `stylist_assessment` type notes excluded from `formatNotesForContext()` (prevents duplication)
- Test: pronouns (`q04_pronouns`) included in `formatIntakeForContext()`

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd c:\kar\abhs && npx vitest run src/lib/chat-context.test.ts
```

Expected: New tests FAIL.

- [ ] **Step 3: Update IntakeContext and formatIntakeForContext**

In `src/lib/chat-context.ts`:
- Add `pronouns` field to `IntakeContext` interface
- Include pronouns in `formatIntakeForContext()` output

- [ ] **Step 4: Update formatNotesForContext**

Modify `formatNotesForContext()` to exclude notes with type `stylist_assessment`.

- [ ] **Step 5: Add stylist notes to buildSystemPrompt**

Update `buildSystemPrompt()` to accept optional `stylistNotes: string` parameter. If present, include as:

```
## Karli's Stylist Notes
{content}
```

Positioned after intake data, before conversation history.

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd c:\kar\abhs && npx vitest run src/lib/chat-context.test.ts
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/chat-context.ts src/lib/chat-context.test.ts
git commit -m "feat: integrate stylist notes into AI chat context"
```

---

## Task 4: Stylist Notes -- API Route Update

**Files:**
- Modify: `src/app/api/admin/chat/route.ts`

- [ ] **Step 1: Read chat API route**

Read `src/app/api/admin/chat/route.ts` to understand how context is assembled.

- [ ] **Step 2: Fetch and pass stylist notes**

In the POST handler:
- Import `getStylistNote` from queries
- Fetch stylist note for the client
- Pass to `buildSystemPrompt()` as the new `stylistNotes` parameter

- [ ] **Step 3: Create stylist notes save endpoint**

Create new API route at `src/app/api/admin/stylist-notes/route.ts`:
- PUT handler: accepts `{ clientId, content }` body
- Auth check required (admin only)
- Call `upsertStylistNote(clientId, content)`
- Return 200 on success
- GET handler: accepts `?clientId=N` query param
- Returns `{ content: string | null }`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/chat/route.ts src/app/api/admin/stylist-notes/route.ts
git commit -m "feat: pass stylist notes to AI context and add save endpoint"
```

---

## Task 5: Stylist Notes -- UI Component

**Files:**
- Modify: `src/components/salon/intake-chat-panel.tsx`

- [ ] **Step 1: Read intake chat panel**

Read `src/components/salon/intake-chat-panel.tsx` fully. Understand the layout, state management, and existing UI.

- [ ] **Step 2: Add stylist notes state and fetch**

Add state for stylist notes:
- `stylistNotes` state (string)
- `noteStatus` state ('idle' | 'saving' | 'saved' | 'error')
- Fetch existing note on mount via the API
- Auto-save on blur: debounce or direct fetch to save endpoint
- Show status indicator: subtle "Saved" / "Saving..." / "Error" text

- [ ] **Step 3: Add collapsible notes field UI**

Add a collapsible text area at the top of the chat panel:
- Label: "Stylist Notes"
- Placeholder: "Your technical assessment, observations, recommendations..."
- Collapse/expand toggle (chevron icon)
- Starts collapsed on mobile
- `onBlur` triggers save

- [ ] **Step 4: Visual verify on dev server**

Check `/admin/intake/[id]` page:
- Chat panel shows Stylist Notes field at top
- Can type notes, blur to save, see "Saved" indicator
- Notes persist across page reloads
- Collapse/expand works
- On mobile, starts collapsed

- [ ] **Step 5: Commit**

```bash
git add src/components/salon/intake-chat-panel.tsx
git commit -m "feat: add Stylist Notes collapsible field to chat panel"
```

---

## Task 6: Draft Response Button & Voice Profile

**Files:**
- Modify: `src/components/salon/intake-chat-panel.tsx`
- Modify: `src/lib/constants/chat-system-prompt.ts`

- [ ] **Step 1: Add voice profile guardrails to system prompt**

Read `src/lib/constants/chat-system-prompt.ts`. Add Karli's voice profile for draft mode:

```
When drafting messages for Karli to send to clients:
- Use the client's first name. Sound like a friend who happens to be a professional.
- Confident but not pushy. No hard sells.
- Honest and direct. No filler, no over-promising.
- Always use client's pronouns from intake if provided.
- No em dashes. No mention of AI. No health/disability references.
- Positive framing always.

SMS tone: Casual, shorter, like texting a friend.
Email tone: Same warmth, more structure. Subject line + greeting + body + sign-off.

Karli does NOT sound like:
- "We appreciate your business" or "At your earliest convenience" (corporate)
- "Dear valued client" or "Thank you for your inquiry" (templated)
- "Don't miss out" or "Limited availability" (pushy)
```

- [ ] **Step 2: Add Draft Response button to chat panel**

In `src/components/salon/intake-chat-panel.tsx`:
- Add "Draft Response" button next to the channel selector (SMS/Email/Both)
- Disabled when: no channel selected, streaming in progress, or loading
- On click: sends pre-built prompt to the chat:

```
Draft a {channel} response to {client_name} based on their intake submission and my stylist notes. Keep it warm, professional, and in my voice.
```

The prompt goes through the normal chat send flow (same as typing a message).

- [ ] **Step 3: Visual verify on dev server**

Check:
- Draft Response button visible next to channel selector
- Disabled when no channel selected
- Clicking sends the draft prompt
- Claude responds with a draft

- [ ] **Step 4: Commit**

```bash
git add src/components/salon/intake-chat-panel.tsx src/lib/constants/chat-system-prompt.ts
git commit -m "feat: add Draft Response button and voice profile guardrails"
```

---

## Task 7: Draft Preview Card

**Files:**
- Modify: `src/components/salon/chat-message.tsx`

- [ ] **Step 1: Read chat message component**

Read `src/components/salon/chat-message.tsx`. Understand how messages render.

- [ ] **Step 2: Add draft card styling**

When a message has `channel_context` (non-null), render it as a draft card:
- Visually distinct: subtle border, slightly different background (e.g., `bg-sage-50 border-sage-200`)
- Channel indicator badge at top ("SMS Draft" / "Email Draft" / "SMS + Email Draft")
- "Copy to Clipboard" button with "Copied!" feedback (2 second timeout)
- Same content rendering as regular messages, just wrapped in the card style

- [ ] **Step 3: Implement copy-to-clipboard**

```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(content)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

- [ ] **Step 4: Visual verify on dev server**

Check:
- Send a draft request via the Draft Response button
- Response renders in a distinct card (not a regular bubble)
- Channel badge shows correctly
- Copy button works, shows "Copied!" feedback

- [ ] **Step 5: Commit**

```bash
git add src/components/salon/chat-message.tsx
git commit -m "feat: draft preview card with copy-to-clipboard and channel badge"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: All tests pass (previous + new stylist notes + context tests).

- [ ] **Step 2: Run production build**

```bash
cd c:\kar\abhs && pnpm build
```

Expected: Clean build.

- [ ] **Step 3: Full chat workflow test**

On dev server, with a real intake record:
1. Open intake detail page
2. Open AI chat panel
3. Type stylist notes, blur to save, verify "Saved"
4. Select SMS channel
5. Click "Draft Response"
6. Verify draft renders in a card with SMS badge
7. Click copy, verify clipboard has the draft text
8. Reload page -- verify stylist notes persisted
9. Upload a test photo -- verify it displays correctly oriented

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix: final polish for backend AI enhancements"
```
