# Service Menu Restructure -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all service descriptions with cut-forward positioning, reposition color as "lived-in enhancements," replace em dashes, and apply positive framing throughout.

**Architecture:** Copy-only change to a single data file. No component changes, no API changes, no schema changes.

**Tech Stack:** TypeScript (data file only)

**Spec:** `docs/superpowers/specs/2026-03-22-service-menu-restructure-design.md`

---

## Task 1: Audit Current Service Descriptions

**Files:**
- Read: `src/content/booking-services-data.ts`
- Read: `src/components/booking/service-picker.tsx` (verify only)

- [ ] **Step 1: Read the full data file**

Read `src/content/booking-services-data.ts`. Note:
- All 9 service entries (names, descriptions, bulletPoints)
- All em dashes (`\u2014` or `—`)
- Current tone and positioning
- Data structure (id, name, description, bulletPoints, price, duration, sortOrder, badge)

- [ ] **Step 2: Read service picker component**

Read `src/components/booking/service-picker.tsx` to confirm how descriptions and bulletPoints render. No changes needed -- just verify the data flows through.

- [ ] **Step 3: Count em dashes**

Search for em dashes in the data file:

```bash
cd c:\kar\abhs && grep -c '—' src/content/booking-services-data.ts
```

Note the count for verification after cleanup.

- [ ] **Step 4: Commit** (nothing to commit -- audit only)

---

## Task 2: Rewrite Cutting Service Descriptions

**Files:**
- Modify: `src/content/booking-services-data.ts`

- [ ] **Step 1: Rewrite Artisan Cut description + bulletPoints**

Lead with:
- Technical precision, craftsmanship
- "Designed to look good for weeks, designed to fit your life"
- Structure that works with natural movement
- "Continues to look intentional as it grows"
- Positive framing only. No "not" or "won't" comparisons.
- Replace all em dashes with `--`

- [ ] **Step 2: Rewrite Signature Cut description**

Lead with:
- Preserving structure and intention of the original design
- A refresh that honors the cut's foundation
- Longevity between full appointments
- Designed for clients who love their current shape
- Replace all em dashes

- [ ] **Step 3: Rewrite Mini Services description + bulletPoints**

Lead with:
- Maintaining the integrity of the cut between full appointments
- Strategic adjustments that serve the overall design
- Keeps the structure working for you longer
- Replace all em dashes

- [ ] **Step 4: Commit**

```bash
git add src/content/booking-services-data.ts
git commit -m "feat: rewrite cutting service descriptions with cut-forward positioning"
```

---

## Task 3: Rewrite Color Service Descriptions

**Files:**
- Modify: `src/content/booking-services-data.ts`

- [ ] **Step 1: Rewrite Root Retouch description + bulletPoints**

Position as lived-in enhancement:
- Restoring harmony between color and cut's structure
- Keeps the overall design fresh and cohesive
- Replace all em dashes

- [ ] **Step 2: Rewrite All-Over Color / Base Enhancement description + bulletPoints**

Position as lived-in enhancement:
- Illuminates the dimension of your cut
- Color designed to grow out gracefully alongside your haircut
- Enriches what's already beautiful about your hair's structure
- Replace all em dashes

- [ ] **Step 3: Rewrite Custom Color 3hr description**

Position as lived-in enhancement:
- Creative layer that supports the cut's architecture
- Lived-in results that evolve gracefully
- Replace all em dashes

- [ ] **Step 4: Rewrite Custom Color 4hr description**

Same positioning. More depth, more time to work thoughtfully. Replace em dashes.

- [ ] **Step 5: Rewrite Custom Color Extended description**

Same positioning. Complex work handled with patience and precision. Replace em dashes.

- [ ] **Step 6: Commit**

```bash
git add src/content/booking-services-data.ts
git commit -m "feat: reposition color services as lived-in enhancements"
```

---

## Task 4: Rewrite Consultation Description

**Files:**
- Modify: `src/content/booking-services-data.ts`

- [ ] **Step 1: Rewrite Consultation description**

Lead with cut assessment:
- Karli assesses the cut foundation first
- Then discusses color if relevant
- A conversation about your hair's potential
- Reinforce cut-forward philosophy from first interaction
- Replace all em dashes

- [ ] **Step 2: Commit**

```bash
git add src/content/booking-services-data.ts
git commit -m "feat: rewrite consultation description with cut-forward positioning"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Verify zero em dashes**

```bash
cd c:\kar\abhs && grep -c '—' src/content/booking-services-data.ts
```

Expected: 0.

- [ ] **Step 2: Run tests**

```bash
cd c:\kar\abhs && npx vitest run
```

Expected: All tests pass (booking validation tests are schema-based, not copy-based).

- [ ] **Step 3: Run build**

```bash
cd c:\kar\abhs && pnpm build
```

Expected: Clean build.

- [ ] **Step 4: Visual verify on dev server**

Check `/book` page:
- All 9 services display correctly
- Descriptions read as cut-forward
- Color services feel like enhancements, not primary
- Bullet points render correctly
- No em dashes visible anywhere
- Expand/collapse descriptions work

- [ ] **Step 5: Read through all descriptions one more time**

Read every description out loud (mentally). Does it:
- Lead with what the client gets? (positive framing)
- Sound like Karli? (warm, confident, personal)
- Position cutting as the foundation?
- Position color as supporting the cut?
- Avoid negative comparisons?

If anything sounds off, revise and recommit.

- [ ] **Step 6: Final commit if any fixes**

```bash
git add src/content/booking-services-data.ts
git commit -m "fix: final polish on service descriptions"
```
