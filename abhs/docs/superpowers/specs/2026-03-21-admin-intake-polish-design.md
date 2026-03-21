## Admin Intake Polish -- Design Spec

**Date:** 2026-03-21
**Project:** All Beauty Hair Studio (ABHS)
**Scope:** Polish admin intake detail page for Karli -- warm visual style, restructured layout, sticky decision bar
**Approach:** Professional warm -- dark sidebar stays, content area gets ABHS brand warmth. Intake page restructured around what Karli actually needs to decide.

---

### Goal

Make the admin intake detail page feel like Karli's space -- warm, clean, scannable. Show her exactly what she needs to prepare for a consultation and make a decision. One glance, one decision. Remove developer-facing elements (score cards, raw text dump). Add sticky accept/decline bar.

---

### Section 1: Visual Warmth (Content Area)

**Sidebar:** No change -- stays dark, functional.

**Content area cards throughout admin:**
- Card backgrounds: `bg-blush-50/40` or `bg-white` with `border-warm-100`
- Section headers: `text-warm-700`
- Primary buttons: `bg-forest-500 hover:bg-forest-600 text-white`
- Secondary buttons: `border-warm-200 text-warm-600 hover:bg-warm-50`
- Badges: Forest green (active), amber (review), copper (highlights)
- Links: `text-forest-500 hover:text-forest-600`

**Scope:** This visual pass applies to the intake detail page only (not all admin pages). Other admin pages can be warmed up in a future pass.

---

### Section 2: Intake Detail Page Restructure

**File:** `src/app/admin/(dashboard)/intake/[id]/page.tsx`

New layout order (top to bottom):

#### 1. Client Header
- Name (large), pronouns inline if provided
- Contact actions (email/phone/text with preferred star)
- Referral source if provided
- Clean, compact -- no card wrapper, just a header section

#### 2. Overall Status Badge
Replaces the three score cards (Readiness, Complexity, Engagement). Single badge using `summary.overallRating` (already computed by the scoring engine):

| Badge | Color | Condition |
|-------|-------|-----------|
| Ready to Book | Forest green (`bg-forest-50 text-forest-700 border-forest-200`) | `overallRating === 'green'` |
| Review Needed | Amber (`bg-amber-50 text-amber-700 border-amber-200`) | `overallRating === 'yellow'` |
| Heads Up | Red (`bg-red-50 text-red-700 border-red-200`) | `overallRating === 'red'` |

Displayed as a large inline badge under the client header. No card wrapper.

**Uses existing scoring engine output directly** -- `summary.overallRating` already accounts for readiness thresholds, color correction flags, and HEADS_UP flags via `GREEN_THRESHOLD` and `YELLOW_THRESHOLD` constants. No re-derivation needed. The three score cards are simply not rendered.

The existing `StatusBadge` (showing pipeline status like "New Intake" / "Under Review") remains in the header -- it shows pipeline status. The new Overall Status Badge shows consultation readiness. Different purposes, both shown.

#### 3. Flags (conditional)
Only shown if flags exist. No card wrapper -- inline badges with descriptions:
- HEADS_UP: Amber badge + description text
- GOOD_FIT: Forest green badge + description text
- NOTE: Warm blue badge + description text

#### 4. Quick Summary Card
The key info Karli needs at a glance. Clean 2-column layout on desktop, stacked on mobile:

| Label | Value |
|-------|-------|
| Service Interest | Haircut & Style, Low Maintenance Color |
| Hair Type | Straight (from `intake.hairTexture`) |
| Thickness | Fine (from `intake.hairDensity`) |
| Hair Length | Short |
| Condition | Hair Loss, Split Ends, Itchy Scalp |
| Maintenance | 6-8 weeks |

Card styled with warm background (`bg-blush-50/40 border-warm-100`).

Data source: parsed from `parseSalonIntakeNote()` output -- `intake.serviceInterest`, `intake.hairTexture`, `intake.hairLength`, `intake.hairDensity`, `intake.hairCondition`, `intake.maintenanceFrequency`.

#### 5. Client Photos
Already built (`IntakePhotoGallery` component with zoom). No changes needed. Only renders if photos exist.

#### 6. In Their Own Words
Two text blocks showing what the client actually wrote:

- **"What they love & hate"** -- `intake.hairLoveHate` (optional, skip if empty)
- **"What they're hoping for"** -- `intake.whatTheyWant` (always present, required field)

Styled as a warm card with the client's text in a slightly larger font. These are the most personal parts of the intake -- Karli reads these to understand the person.

#### 7. Hair Details Card
Consultation prep specifics in a clean list:

- **Hair history** -- treatments in last 2 years (comma-separated)
- **Color reaction** -- reaction types or "No reaction"
- **Products** -- the 6 labeled fields (only show non-empty ones)
- **Styling description** -- their self-description
- **Daily routine** -- how they do their hair day-to-day
- **Shampoo frequency** -- how often

Card styled warm. Each item is a label + value row.

#### 8. Additional Info
Last card, muted styling:

- **Medical/allergy info** -- if provided
- **Availability** -- their selected time slots

#### REMOVED
- Three score cards (Readiness, Complexity, Engagement)
- Raw "Full Intake Submission" `<pre>` text dump

---

### Section 3: Sticky Decision Bar

**Component:** New client component `src/components/salon/intake-decision-bar.tsx`

- Fixed to bottom of viewport (`fixed bottom-0 left-0 right-0`)
- Safe area insets for iPhone: `pb-[env(safe-area-inset-bottom)]`
- Semi-transparent warm background: `bg-white/95 backdrop-blur-sm border-t border-warm-200`
- Padded content area: `px-4 py-3` + safe area bottom
- Layout: Client name on left, buttons on right (mobile: full-width stacked buttons)
- "Accept Client" button: `bg-forest-500 text-white` with check icon
- "Decline" button: `border-warm-200 text-warm-500` with X icon (outline style)
- `z-40` (below modals at z-50)
- Only rendered when intake status is `intake_submitted` or `ai_review`
- Main content area needs `pb-24` (or similar) to prevent the sticky bar from covering content

**Viewport meta tag:** Add `viewport-fit=cover` to enable safe area insets on iOS. Scope to admin layout only (`src/app/admin/layout.tsx`) to avoid affecting public pages that haven't been audited for safe-area compatibility. Use Next.js `metadata.viewport` export:

```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};
```

**Accept action:** Sticky bar Accept button calls the same API as `SalonReviewActions` -- `PUT /api/clients/{id}/stage` with `{ stage: 'active_client' }`.

**Decline action:** Sticky bar Decline button opens a modal dialog (not inline expansion) with a textarea for decline reason + Confirm Decline button. This keeps the sticky bar clean while preserving the decline-reason flow from `SalonReviewActions`. The modal sits at `z-50` (above the sticky bar at `z-40`).

**After accept/decline:** Sticky bar disappears (status is no longer reviewable), page refreshes to show updated status badge.

---

### Files Modified

| File | Changes |
|------|---------|
| `src/app/admin/(dashboard)/intake/[id]/page.tsx` | Complete restructure: new layout order, remove score cards, remove raw dump, add overall badge, warm styling, import new components |
| `src/components/salon/intake-decision-bar.tsx` | NEW: Sticky bottom bar with accept/decline for reviewable intakes |
| `src/components/salon/salon-review-actions.tsx` | May need to extract accept/decline API logic into a shared hook or pass handlers to decision bar |
| `src/app/admin/layout.tsx` | Add `viewport-fit=cover` via metadata viewport export (admin only) |

---

### What Does NOT Change

- Scoring engine (salon-summary.ts, salon-scoring-rules.ts) -- stays intact, badge reads its output
- Sidebar navigation or layout structure
- Intake queue list page
- Photo gallery component (already built)
- API routes
- Database schema
- Other admin pages (dashboard, clients, pipeline, calendar, color lab)

---

### Testing Plan

- Run `npx vitest run` before and after -- 268 tests must pass
- Visual verification on dev server:
  - Intake detail page shows new layout
  - Photos display correctly
  - Sticky bar visible on mobile (test iPhone Safari safe area)
  - Accept/Decline still works (API calls, status updates)
  - Already-accepted intakes don't show sticky bar
  - Declined intakes don't show sticky bar
- No new tests needed (this is a visual/layout change, no logic changes)
- The overall badge logic is simple conditional -- test manually with different intake profiles
