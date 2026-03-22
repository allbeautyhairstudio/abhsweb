# Public Site Content & Visual Refresh -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh ABHS public site with cut-forward positioning, rewrite footer/FAQ, add mobile sticky CTA, fully remove Color Lab, rework client detail page to 4 tabs, and replace rule-based intake scoring with AI-generated briefing.

**Architecture:** Content and copy changes to public pages + full Color Lab deletion (code, DB, API, tests) + client detail tab restructure + new AI summary generation endpoint using Anthropic SDK. All changes are in the existing Next.js 16 App Router codebase with SQLite.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, SQLite (better-sqlite3), Anthropic SDK (@anthropic-ai/sdk), Vitest

**Spec:** `docs/superpowers/specs/2026-03-22-public-site-refresh-design.md`

---

## Task 1: Footer Rewrite

**Files:**
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Read current footer.tsx**

Read the full file to understand current structure, imports, and layout.

- [ ] **Step 2: Update brand heading**

Change "Karli Rosario" to "All Beauty Hair Studio" in the brand column heading.

- [ ] **Step 3: Update location and hours**

- Change location text to "Located inside The Colour Parlor"
- Wrap address in a Google Maps link: `<a href="https://maps.google.com/?q=All+Beauty+Hair+Studio+Wildomar+CA" target="_blank" rel="noopener noreferrer">`
- Change schedule from "By appointment only, 3 days per week" to "By Appointment Only | Tuesday - Thursday"

- [ ] **Step 4: Update copyright**

Change copyright text from "Karli Rosario" to "All Beauty Hair Studio".

- [ ] **Step 5: Visual verify on dev server**

Run: `cd c:\kar\abhs && pnpm dev`
Check footer on homepage at `localhost:3005`. Verify:
- "All Beauty Hair Studio" heading
- "Located inside The Colour Parlor" text
- Address links to Google Maps (opens in new tab)
- "By Appointment Only | Tuesday - Thursday"
- Copyright says "All Beauty Hair Studio"

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat: rewrite footer with ABHS primary brand and Tue-Thu schedule"
```

---

## Task 2: FAQ Additions & Cancellation Reword

**Files:**
- Modify: `src/app/(public)/faq/page.tsx`

- [ ] **Step 1: Read current FAQ page**

Read the full file. Note the FAQ data structure (array of objects with question/answer).

- [ ] **Step 2: Add schedule question**

Insert after the location question (position 6):
- Q: "Why are you only available Tuesday through Thursday?"
- A: Frame as intentional choice for focused, high-energy sessions. Dedicated one-on-one time means quality over quantity. Empowering tone, not apologetic. No mention of health conditions.

- [ ] **Step 3: Reword cancellation policy**

Find existing cancellation question. Reframe from "may have a fee" to mutual respect of a limited schedule. 24-hour notice. A no-show means another guest missed an opportunity. Same policy, warmer reasoning.

- [ ] **Step 4: Add payment question**

Add near the end:
- Q: "What payment methods do you accept?"
- A: All major cards and digital payments accepted. Cash welcomed and appreciated for supporting a small business. Afterpay available for premium services.

- [ ] **Step 5: Add Afterpay question**

Add after payment:
- Q: "Do you offer Afterpay?"
- A: Yes, accepted through Square. Brief, confident.

- [ ] **Step 6: Verify no em dashes in any answer**

Search the file for `\u2014` (em dash). Replace any with `--` or `-`.

- [ ] **Step 7: Visual verify on dev server**

Check `/faq` page. Verify 11 questions render correctly, accordions open/close, new questions are in correct order.

- [ ] **Step 8: Commit**

```bash
git add src/app/(public)/faq/page.tsx
git commit -m "feat: add schedule, payment, Afterpay FAQs and reword cancellation policy"
```

---

## Task 3: Mobile Sticky "Book Now" Button

**Files:**
- Create: `src/components/layout/mobile-sticky-cta.tsx`
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Create mobile sticky CTA component**

Create `src/components/layout/mobile-sticky-cta.tsx`:
- `"use client"` directive (needs `usePathname()`)
- Fixed bottom bar, hidden above `md` breakpoint (`hidden md:hidden` or `block md:hidden`)
- "Book Now" button linking to `/book`
- `env(safe-area-inset-bottom)` padding for iPhone Safari
- Hidden on `/book`, `/newclientform` paths (check with `usePathname()`)
- 44px min height, 4.5:1 contrast, keyboard accessible
- Slight top shadow (`shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`)
- Z-index below mobile nav drawer (z-40 or similar)

- [ ] **Step 2: Add to public layout**

Modify `src/app/(public)/layout.tsx`:
- Import `MobileStickyCta` component
- Add `<MobileStickyCta />` before closing tag of layout (after `{children}`, before footer or at layout bottom)

- [ ] **Step 3: Visual verify on dev server**

Check on mobile viewport (Chrome DevTools, 375px width):
- Sticky bar visible on homepage, gallery, philosophy, FAQ
- Hidden on `/book` and `/newclientform`
- Tapping navigates to `/book`
- Bar doesn't overlap footer on scroll
- Safe area padding works (simulate with DevTools)

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/mobile-sticky-cta.tsx src/app/(public)/layout.tsx
git commit -m "feat: add mobile sticky Book Now button with iPhone safe area"
```

---

## Task 4: Image Swap Point Constants

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/gallery/page.tsx`

- [ ] **Step 1: Extract homepage banner image to constant**

In `src/app/(public)/page.tsx`, find the bottom banner section using `/scizzors.webp`. Extract to a named constant at the top of the file:

```typescript
const HOMEPAGE_BANNER_IMAGE = '/scizzors.webp'
```

Replace the inline string with the constant.

- [ ] **Step 2: Extract gallery header image to constant**

In `src/app/(public)/gallery/page.tsx`, find the header image (Unsplash URL). Extract to:

```typescript
const GALLERY_HEADER_IMAGE = '...' // current URL
```

Replace the inline string with the constant.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/page.tsx src/app/(public)/gallery/page.tsx
git commit -m "refactor: extract image swap point constants for future photo replacements"
```

---

## Task 5: Cut-Forward Positioning + My Journey Link

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/philosophy/page.tsx`

- [ ] **Step 1: Read homepage and philosophy pages**

Read both files fully to understand current copy.

- [ ] **Step 2: Update "Person Behind the Chair" section**

In homepage `page.tsx`:
- Shift emphasis to cutting craft, precision, intentional design
- Lead with technical cutting expertise
- Add subtle "My Journey" text link at end of section: `<a href="/about" className="text-forest-600 hover:text-forest-700 text-sm inline-flex items-center gap-1">My Journey <ArrowRight className="w-3 h-3" /></a>`

- [ ] **Step 3: Update "What Makes This Different" grid**

Reframe 3-column grid to lead with cutting precision/structure:
- Column 1: Cut craftsmanship / precision / structure
- Column 2: Graceful grow-out / longevity
- Column 3: Personal approach / capacity-aware
- All positive framing. No negative comparisons.

- [ ] **Step 4: Update philosophy page**

In `philosophy/page.tsx`:
- Ensure "How It Works in Practice" leads with cutting as foundation
- Color positioned as enhancement
- Minor copy tweaks only

- [ ] **Step 5: Verify no em dashes**

Search both files for `\u2014`. Replace any with `--` or `-`.

- [ ] **Step 6: Visual verify on dev server**

Check homepage and philosophy page. Read the copy -- does it feel cut-forward? Does the My Journey link work and look subtle?

- [ ] **Step 7: Commit**

```bash
git add src/app/(public)/page.tsx src/app/(public)/philosophy/page.tsx
git commit -m "feat: cut-forward positioning on homepage and philosophy, add My Journey link"
```

---

## Task 6: Color Lab Full Removal

**Files to DELETE:**
- `src/app/admin/(dashboard)/color-lab/page.tsx`
- `src/components/color/formula-form.tsx`
- `src/components/color/formula-timeline.tsx`
- `src/components/color/inventory-overview.tsx`
- `src/components/color/shade-picker.tsx`
- `src/app/api/color/formulas/route.ts`
- `src/app/api/color/formulas/[id]/route.ts`
- `src/app/api/color/formulas/[id]/duplicate/route.ts`
- `src/app/api/color/inventory/route.ts`
- `src/app/api/color/inventory/alerts/route.ts`
- `src/app/api/color/lines/route.ts`
- `src/app/api/color/shades/route.ts`
- `src/lib/queries/color.ts`
- `src/lib/constants/color-brands.ts`
- `src/lib/color.test.ts`

**Files to MODIFY:**
- `src/components/layout/admin-sidebar.tsx` (remove Color Lab nav item)
- `src/app/admin/(dashboard)/page.tsx` (remove Low Stock Alerts card)
- `src/components/clients/client-detail-tabs.tsx` (remove Color History tab)
- `src/lib/schema.ts` (remove 4 CREATE TABLE statements for color tables)

- [ ] **Step 1: Delete Color Lab directories and files**

Delete all files listed above. Use `rm` or file system deletion.

```bash
cd c:\kar\abhs
rm -rf src/app/admin/\(dashboard\)/color-lab/
rm -rf src/components/color/
rm -rf src/app/api/color/
rm src/lib/queries/color.ts
rm src/lib/constants/color-brands.ts
rm src/lib/color.test.ts
```

- [ ] **Step 2: Remove Color Lab from admin sidebar**

Read `src/components/layout/admin-sidebar.tsx`. Find the Color Lab nav item and remove it.

- [ ] **Step 3: Remove Low Stock Alerts from dashboard**

Read `src/app/admin/(dashboard)/page.tsx`. Find and remove the Low Stock Alerts card and any color-related imports.

- [ ] **Step 4: Remove Color History, AI Summary, and Engagement tabs from client detail**

Read `src/components/clients/client-detail-tabs.tsx`. Remove:
- Color History tab and its import (`FormulaTimeline` from `@/components/color/formula-timeline`)
- AI Summary tab and its import (`salon-summary-tab`)
- Engagement tab (placeholder)
- Adjust tab indices. Result: 4 tabs (Overview, Intake Data, Bookings, Notes & History).

**Note:** This removes all three tabs in one step to avoid broken imports. Task 7 enhances the Overview tab after this cleanup.

- [ ] **Step 5: Remove color table schemas**

Read `src/lib/schema.ts`. Remove the CREATE TABLE statements for `color_lines`, `color_shades`, `color_formulas`, `color_inventory`.

- [ ] **Step 6: Grep for remaining color references**

```bash
cd c:\kar\abhs && grep -r "color-lab\|color_lines\|color_shades\|color_formulas\|color_inventory\|FormulaTimeline\|shade-picker\|formula-form\|inventory-overview\|color-brands" src/ --include="*.ts" --include="*.tsx" -l
```

Remove any remaining references found.

- [ ] **Step 7: Run tests**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: ~244 tests passing (292 - 48 color tests). Zero failures.

- [ ] **Step 8: Run build**

```bash
cd c:\kar\abhs && pnpm build
```

Expected: Clean build with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: remove Color Lab entirely (code, DB tables, API routes, 48 tests)"
```

---

## Task 7: Client Detail Page Rework (7 Tabs to 4)

**Files:**
- Modify: `src/components/clients/client-detail-tabs.tsx`
- Modify: `src/app/admin/(dashboard)/clients/[id]/page.tsx`

- [ ] **Step 1: Read client detail tabs and page**

Read both files fully. Understand the tab structure, imports, and data flow.

- [ ] **Step 2: Verify tab structure**

AI Summary, Engagement, and Color History tabs were already removed in Task 6 Step 4. Confirm 4 tabs remain: Overview, Intake Data, Bookings, Notes & History.

- [ ] **Step 3: Enhance Overview tab -- Contact preferences**

Add preferred contact method display with a badge/star. Pull from client's `q05_contact_preference` field. Display pronouns if present (`q04_pronouns`).

- [ ] **Step 4: Enhance Overview tab -- Hair Profile card**

Create a "Hair Profile" card on the Overview tab pulling from intake q-columns:
- Texture, Length, Condition, Color history, Goals
- Clean, scannable card layout
- Show "--" for empty fields

- [ ] **Step 5: Enhance Overview tab -- Visit Summary card**

Create a "Visit Summary" card:
- Last appointment, next appointment, total visits
- Pull from `booking_requests` table (approved bookings) or Square API data
- "View all" link to Bookings tab

- [ ] **Step 6: Enhance Overview tab -- Stylist Notes (read-only)**

Add a "Stylist Notes" section on the Overview tab:
- Displays the stylist note content if one exists (type `stylist_assessment` from `client_notes` table)
- Read-only on this page (editable in the AI chat panel, per Spec B)
- Shows "--" or "No notes yet" if empty
- **Cross-plan dependency:** The full editable Stylist Notes field is implemented in Plan B (Backend & AI Enhancements). This step adds the read-only display on the Overview tab.

- [ ] **Step 6: Visual verify on dev server**

Check `/admin/clients/[id]` page:
- 4 tabs visible (Overview, Intake Data, Bookings, Notes & History)
- Hair Profile card shows intake data
- Contact preference highlighted
- Visit Summary shows booking data

- [ ] **Step 7: Run tests**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: All remaining tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: rework client detail to 4 tabs with enhanced Overview"
```

---

## Task 8: AI-Generated Intake Summary (Replace Rule-Based Scoring)

**Files to DELETE:**
- `src/lib/salon-summary.ts`
- `src/lib/salon-summary.test.ts`
- `src/lib/constants/salon-scoring-rules.ts`
- `src/components/salon/salon-score-card.tsx`
- `src/components/salon/salon-summary-tab.tsx`
- `src/app/api/admin/salon/summary/[id]/route.ts`

**Files to CREATE:**
- `src/lib/queries/ai-summary.ts` (cache CRUD)
- `src/lib/queries/ai-summary.test.ts` (cache tests)
- `src/lib/ai-intake-summary.ts` (prompt + generation logic)
- `src/lib/ai-intake-summary.test.ts` (prompt construction tests)
- `src/app/api/admin/intake-summary/[id]/route.ts` (generation endpoint)
- `src/components/salon/ai-intake-briefing.tsx` (briefing card UI)

**Files to MODIFY:**
- `src/lib/schema.ts` (add `ai_summaries` table)
- `src/lib/chat-context.ts` (remove `formatSummaryForContext()`, use cached AI summary)
- `src/app/admin/(dashboard)/intake/[id]/page.tsx` (replace scoring card with AI briefing)

- [ ] **Step 1: Add AI summary cache table to schema**

In `src/lib/schema.ts`, add:

```sql
CREATE TABLE IF NOT EXISTS ai_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL UNIQUE,
  badge TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT NOT NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
)
```

- [ ] **Step 2: Write AI summary cache query tests**

Create `src/lib/queries/ai-summary.test.ts`:
- Test `getCachedSummary(clientId)` returns null when no cache
- Test `saveSummary(clientId, data)` stores and retrieves
- Test `invalidateSummary(clientId)` clears cache
- Test cascade delete (when client deleted, summary deleted)

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd c:\kar\abhs && npx vitest run src/lib/queries/ai-summary.test.ts
```

Expected: FAIL (functions don't exist yet).

- [ ] **Step 4: Implement AI summary cache queries**

Create `src/lib/queries/ai-summary.ts`:
- `getCachedSummary(clientId: number)` -- returns cached summary or null
- `saveSummary(clientId: number, data: { badge: string, summary: string, keyPoints: string[] })` -- upsert
- `invalidateSummary(clientId: number)` -- delete cache entry

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd c:\kar\abhs && npx vitest run src/lib/queries/ai-summary.test.ts
```

Expected: PASS.

- [ ] **Step 6: Write AI summary prompt construction tests**

Create `src/lib/ai-intake-summary.test.ts`:
- Test prompt includes intake data
- Test prompt includes 8 Pillars guardrails (non-bias, inclusive, etc.)
- Test prompt requests badge + summary + key points structure
- Test prompt enforces brevity (3-5 sentences, 3-5 bullets)
- Test response parsing extracts badge, summary, key_points

- [ ] **Step 7: Run tests to verify they fail**

```bash
cd c:\kar\abhs && npx vitest run src/lib/ai-intake-summary.test.ts
```

Expected: FAIL.

- [ ] **Step 8: Implement AI summary generation logic**

Create `src/lib/ai-intake-summary.ts`:
- `buildSummaryPrompt(intake: IntakeContext)` -- constructs the prompt with:
  - Full intake data
  - 8 Pillars guardrails
  - Badge options (Ready to Book / Review Needed / Heads Up)
  - "Here's What I See" section instructions (3-5 sentences max)
  - "At a Glance" key points (3-5 bullets)
  - Brevity guardrail: ADHD-friendly, concise, calm clarity
- `parseSummaryResponse(text: string)` -- extracts structured data from Claude's response
- `generateIntakeSummary(intake: IntakeContext)` -- calls Anthropic SDK, returns structured summary

- [ ] **Step 9: Run tests to verify they pass**

```bash
cd c:\kar\abhs && npx vitest run src/lib/ai-intake-summary.test.ts
```

Expected: PASS (prompt construction and parsing tests -- SDK call is mocked).

- [ ] **Step 10: Create API endpoint for summary generation**

Create `src/app/api/admin/intake-summary/[id]/route.ts`:
- GET: Check cache first. If cached, return it. If not, generate via Claude, cache, return.
- Auth check required (admin only)
- Error handling: if Anthropic API fails, return `{ error: "Summary unavailable" }`

- [ ] **Step 11: Create AI briefing card component**

Create `src/components/salon/ai-intake-briefing.tsx`:
- Client component (`"use client"`)
- Fetches from `/api/admin/intake-summary/{id}` on mount
- Loading state while generating
- Renders: badge (green/amber/red), "Here's What I See" paragraph, "At a Glance" bullets
- Error state: "Summary unavailable -- review intake details below"
- Clean, warm ABHS styling consistent with intake detail page

- [ ] **Step 12: Delete old scoring engine files**

```bash
cd c:\kar\abhs
rm src/lib/salon-summary.ts
rm src/lib/salon-summary.test.ts
rm src/lib/constants/salon-scoring-rules.ts
rm src/components/salon/salon-score-card.tsx
rm src/components/salon/salon-summary-tab.tsx
rm src/app/api/admin/salon/summary/[id]/route.ts
```

- [ ] **Step 13: Update intake detail page**

Modify `src/app/admin/(dashboard)/intake/[id]/page.tsx`:
- Remove imports for `assessSalonIntake`, `generateHighlights`, `detectFlags`
- Replace the "What Karli Needs to Know" scoring card with `<AiIntakeBriefing clientId={id} />`
- Keep the rest of the page (Q&A sections, photos, accept/decline bar, chat panel)

- [ ] **Step 14: Update chat context**

Modify `src/lib/chat-context.ts`:
- Remove `formatSummaryForContext()` function
- Update `buildSystemPrompt()` to not include rule-based scores
- If cached AI summary exists, include it in context instead

- [ ] **Step 15: Grep for remaining salon-summary references**

```bash
cd c:\kar\abhs && grep -r "salon-summary\|assessSalonIntake\|generateHighlights\|detectFlags\|salon-scoring-rules\|SalonSummary\|salon-score-card\|salon-summary-tab" src/ --include="*.ts" --include="*.tsx" -l
```

Remove any remaining references.

- [ ] **Step 16: Run all tests**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: ~171 tests passing (244 - 73 scoring tests + new AI summary tests). Zero failures.

- [ ] **Step 17: Run build**

```bash
cd c:\kar\abhs && pnpm build
```

Expected: Clean build.

- [ ] **Step 18: Visual verify on dev server**

Check `/admin/intake/[id]` page:
- AI briefing card loads at top (may take 2-3 seconds first load)
- Badge shows (Ready to Book / Review Needed / Heads Up)
- Summary paragraph is concise and insightful
- Key points are scannable
- Second visit loads instantly from cache
- Chat panel still works

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: replace rule-based scoring with AI-generated intake briefing"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run production build**

```bash
cd c:\kar\abhs && pnpm build
```

Expected: Clean build, no errors.

- [ ] **Step 3: Full visual walkthrough**

On dev server, check:
- [ ] Homepage: cut-forward copy, My Journey link works
- [ ] Philosophy: cut-forward copy
- [ ] Gallery: header image constant in place
- [ ] FAQ: 11 questions, all accordions work
- [ ] Footer: ABHS brand, Tue-Thu, Google Maps link
- [ ] Mobile: sticky Book Now on all public pages (not /book, not /newclientform)
- [ ] Admin sidebar: no Color Lab
- [ ] Admin dashboard: no Low Stock Alerts
- [ ] Client detail: 4 tabs, enhanced Overview
- [ ] Intake detail: AI briefing card, no scoring cards

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix: final polish for public site refresh"
```
