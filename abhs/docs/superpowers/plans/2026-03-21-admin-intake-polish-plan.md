# Admin Intake Polish -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the admin intake detail page to match ABHS brand warmth, restructure layout for Karli's decision-making, add sticky accept/decline bar with iPhone safe area support.

**Architecture:** Three independent changes: (1) new sticky decision bar component, (2) restructured intake detail page, (3) viewport-fit for admin layout. The intake page is the main work -- complete rewrite of the JSX render while keeping all data fetching/parsing intact.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide icons

**Spec:** `docs/superpowers/specs/2026-03-21-admin-intake-polish-design.md`

---

## Task Dependency Map

```
Task 1 (decision bar component) ──┐
                                   ├── Task 3 (intake page restructure)
Task 2 (viewport-fit)  ───────────┘
                                        Task 4 (verify + commit)
```

**Parallelizable:** Tasks 1 and 2 are independent. Task 3 depends on Task 1 (imports the new component).

---

## Task 1: Create Sticky Decision Bar Component

**Files:**
- Create: `src/components/salon/intake-decision-bar.tsx`

**Subagent eligible:** Yes (new file, independent)

- [ ] **Step 1: Create the component**

Client component with accept/decline logic extracted from `SalonReviewActions`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntakeDecisionBarProps {
  clientId: number;
  clientName: string;
}
```

**State:** `action` (idle/accepting/declining/done), `showDeclineModal`, `declineReason`, `error`

**Accept handler:** Same API call as `SalonReviewActions`:
```typescript
PUT /api/admin/salon/summary/${clientId}
body: { action: 'accept' }
```

**Decline handler:** Same API call:
```typescript
PUT /api/admin/salon/summary/${clientId}
body: { action: 'decline', decline_reason: declineReason || undefined }
```

**Render:**

When `action === 'done'`: Show success/decline banner (not the bar).

When `showDeclineModal`: Fixed overlay modal (`z-50`) with:
- Dark backdrop
- Centered card with decline reason textarea + Confirm Decline + Cancel buttons
- Warm styling matching ABHS brand

Default: Sticky bottom bar:
```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-warm-200"
     style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
  <div className="px-4 py-3 flex items-center gap-3 max-w-4xl mx-auto">
    <span className="text-sm text-warm-600 truncate flex-1 hidden sm:block">{clientName}</span>
    <Button onClick={handleAccept} className="bg-forest-500 hover:bg-forest-600 text-white flex-1 sm:flex-none min-h-[44px]">
      <CheckCircle2 size={16} className="mr-1.5" /> Accept
    </Button>
    <Button variant="outline" onClick={() => setShowDeclineModal(true)} className="border-warm-200 text-warm-500 flex-1 sm:flex-none min-h-[44px]">
      <XCircle size={16} className="mr-1.5" /> Decline
    </Button>
  </div>
</div>
```

Mobile: buttons are equal-width (`flex-1`), client name hidden. Desktop: buttons are auto-width, client name visible.

After accept/decline completes: `router.refresh()` to reload the page with updated status.

---

## Task 2: Add viewport-fit to Admin Layout

**Files:**
- Modify: `src/app/admin/layout.tsx`

**Subagent eligible:** Yes (one-line change, independent)

- [ ] **Step 1: Add viewport metadata**

Read the file first. Add the viewport export for iOS safe area support:

```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};
```

This is scoped to the admin layout only -- does not affect public pages.

---

## Task 3: Restructure Intake Detail Page

**Files:**
- Modify: `src/app/admin/(dashboard)/intake/[id]/page.tsx`

**Run after:** Task 1 (imports `IntakeDecisionBar`)

This is the main work. The page is a server component that fetches data and renders JSX. All data fetching stays the same. Only the render output changes.

- [ ] **Step 1: Update imports**

Remove: `SalonScoreCard` import, `Brain`, `Heart`, `ClipboardCheck` icons
Add: `IntakeDecisionBar` import, `IntakePhotoGallery` (already imported)
Keep: All data fetching imports (`getClientById`, `getIntakeNote`, `parseSalonIntakeNote`, `assessSalonIntake`, etc.)

- [ ] **Step 2: Keep data fetching, remove score card rendering**

The server component body stays the same up to the return statement. All of `getClientById`, `getIntakeNote`, `parseSalonIntakeNote`, `assessSalonIntake`, photo file reading -- all unchanged.

- [ ] **Step 3: Rewrite the JSX render**

New layout order. Use warm styling throughout:

**Section 1 -- Client Header + Status:**
```tsx
{/* Back link */}
<Link href="/admin/intake" className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-600 transition-colors">
  <ArrowLeft size={16} /> Back to Intake Queue
</Link>

{/* Client Header */}
<div>
  <div className="flex items-start justify-between">
    <div>
      <h1 className="text-2xl font-bold text-warm-800">{client.q02_client_name}</h1>
      <ClientContactActions email={...} phone={...} preferredContact={...} variant="full" />
      <div className="flex items-center gap-2 mt-2">
        <StatusBadge status={client.status} />
        {client.referral_source && (
          <span className="text-xs text-warm-400">Referred by: {client.referral_source}</span>
        )}
      </div>
    </div>
  </div>

  {/* Overall Status Badge */}
  <div className="mt-3">
    <OverallBadge rating={summary.overallRating} />
  </div>
</div>
```

`OverallBadge` is a simple inline helper function (not a separate component):
```tsx
function OverallBadge({ rating }: { rating: 'green' | 'yellow' | 'red' }) {
  const config = {
    green: { label: 'Ready to Book', className: 'bg-forest-50 text-forest-700 border-forest-200' },
    yellow: { label: 'Review Needed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    red: { label: 'Heads Up', className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { label, className } = config[rating];
  return <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${className}`}>{label}</span>;
}
```

**Section 2 -- Flags (conditional):**
Only render if `summary.flags.length > 0`. No card wrapper -- just a `div` with inline flag badges:
```tsx
{summary.flags.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {summary.flags.map(flag => flagBadge(flag))}
  </div>
)}
```
Keep existing `flagBadge()` helper but update colors to warm palette.

**Section 3 -- Quick Summary Card:**
```tsx
<Card className="bg-blush-50/40 border-warm-100">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm text-warm-700">At a Glance</CardTitle>
  </CardHeader>
  <CardContent>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      <SummaryRow label="Service Interest" value={intake.serviceInterest.join(', ') || 'Not specified'} />
      <SummaryRow label="Hair Type" value={intake.hairTexture || 'Not specified'} />
      <SummaryRow label="Thickness" value={intake.hairDensity || 'Not specified'} />
      <SummaryRow label="Length" value={intake.hairLength || 'Not specified'} />
      <SummaryRow label="Condition" value={intake.hairCondition?.join(', ') || 'Not specified'} />
      <SummaryRow label="Maintenance" value={intake.maintenanceFrequency || 'Not specified'} />
    </dl>
  </CardContent>
</Card>
```

`SummaryRow` helper:
```tsx
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between sm:block">
      <dt className="text-warm-400 text-xs">{label}</dt>
      <dd className="text-warm-700 font-medium">{value}</dd>
    </div>
  );
}
```

**Section 4 -- Client Photos:**
```tsx
{hasPhotos && <IntakePhotoGallery photos={photoFiles} />}
```
Already built, no changes.

**Section 5 -- In Their Own Words:**
```tsx
<Card className="bg-blush-50/40 border-warm-100">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm text-warm-700">In Their Own Words</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {intake.hairLoveHate && (
      <div>
        <p className="text-xs text-warm-400 mb-1">What they love & hate about their hair</p>
        <p className="text-sm text-warm-700 leading-relaxed">{intake.hairLoveHate}</p>
      </div>
    )}
    <div>
      <p className="text-xs text-warm-400 mb-1">What they're hoping for</p>
      <p className="text-sm text-warm-700 leading-relaxed">{intake.whatTheyWant}</p>
    </div>
  </CardContent>
</Card>
```

**Section 6 -- Hair Details:**
```tsx
<Card className="bg-blush-50/40 border-warm-100">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm text-warm-700">Hair Details</CardTitle>
  </CardHeader>
  <CardContent>
    <dl className="space-y-2 text-sm">
      <DetailRow label="Hair History" value={intake.hairHistory?.join(', ')} />
      <DetailRow label="Color Reaction" value={intake.colorReaction?.join(', ')} />
      {/* Products -- only non-null fields */}
      <DetailRow label="Shampoo" value={intake.products?.shampoo} />
      <DetailRow label="Conditioner" value={intake.products?.conditioner} />
      <DetailRow label="Hair Spray" value={intake.products?.hairSpray} />
      <DetailRow label="Dry Shampoo" value={intake.products?.dryShampoo} />
      <DetailRow label="Heat Protector" value={intake.products?.heatProtector} />
      <DetailRow label="Other Products" value={intake.products?.other} />
      <DetailRow label="Styling" value={intake.stylingDescription} />
      <DetailRow label="Daily Routine" value={intake.dailyRoutine} />
      <DetailRow label="Shampoo Frequency" value={intake.shampooFrequency} />
    </dl>
  </CardContent>
</Card>
```

`DetailRow` helper -- skips null/empty values:
```tsx
function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="text-warm-400 text-xs sm:w-36 flex-shrink-0">{label}</dt>
      <dd className="text-warm-700">{value}</dd>
    </div>
  );
}
```

**Section 7 -- Additional Info:**
```tsx
<Card className="bg-white border-warm-100">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm text-warm-400">Additional Info</CardTitle>
  </CardHeader>
  <CardContent>
    <dl className="space-y-2 text-sm">
      <DetailRow label="Medical/Allergy" value={intake.medicalInfo} />
      <DetailRow label="Availability" value={intake.availability?.join(', ')} />
    </dl>
  </CardContent>
</Card>
```

**Section 8 -- Sticky Decision Bar:**
```tsx
{isReviewable && <IntakeDecisionBar clientId={numId} clientName={client.q02_client_name} />}
```

Add bottom padding to the main content wrapper when bar is visible:
```tsx
<div className={`space-y-6 ${isReviewable ? 'pb-24' : ''}`}>
```

**Section 9 -- Accepted/Declined status messages:**
Keep existing accepted/declined cards but update to warm styling.

- [ ] **Step 4: Remove old components**

Remove from the JSX:
- Three `SalonScoreCard` components
- The `SalonReviewActions` component (replaced by sticky bar)
- The raw `<pre>` intake dump card
- The old `SalonScoreCard` import

Remove the `SalonScoreCard` import. Keep `SalonReviewActions` file intact (other pages might use it).

- [ ] **Step 5: Update StatusBadge helper**

Update colors to warm palette:
```tsx
const styles: Record<string, string> = {
  intake_submitted: 'bg-copper-100 text-copper-700 border-copper-300',
  ai_review: 'bg-amber-50 text-amber-700 border-amber-200',
  active_client: 'bg-forest-50 text-forest-700 border-forest-200',
  followup: 'bg-forest-50/50 text-forest-600 border-forest-100',
  declined: 'bg-red-50 text-red-700 border-red-200',
};
```

---

## Task 4: Verify and Commit

**Run after:** All tasks complete

- [ ] **Step 1: Run tests**

Run: `cd c:/kar/abhs && npx vitest run`
Expected: 268 tests pass

- [ ] **Step 2: Type check**

Run: `cd c:/kar/abhs && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Build**

Run: `cd c:/kar/abhs && pnpm build`
Expected: Production build succeeds

- [ ] **Step 4: Visual verification**

Start dev server and check intake detail page on mobile + desktop:
- Overall badge shows correct rating
- Flags render inline (no card wrapper)
- Quick summary shows all fields
- Photos display with zoom
- "In Their Own Words" shows client text
- Hair details list is clean
- Sticky bar visible at bottom on mobile
- Decline opens modal with textarea
- Accept works and bar disappears
- iPhone safe area respected (if testable)
- No horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add \
  abhs/src/components/salon/intake-decision-bar.tsx \
  abhs/src/app/admin/\(dashboard\)/intake/\[id\]/page.tsx \
  abhs/src/app/admin/layout.tsx
git commit -m "feat: polish admin intake page with warm ABHS styling

- Restructured layout: summary, photos, goals, details, additional
- Single status badge replaces 3 score cards (Ready/Review/Heads Up)
- Sticky accept/decline bar with iPhone safe area support
- Decline opens modal dialog for reason entry
- Warm ABHS brand styling (blush/cream/forest/copper)
- Removed raw text dump and developer-facing score breakdowns
- Content-first design for Karli's consultation prep"
```

---

## Execution Strategy

| Wave | Tasks | Why parallel |
|------|-------|-------------|
| Wave 1 | Task 1 (decision bar) + Task 2 (viewport-fit) | Independent files |
| Wave 2 | Task 3 (page restructure) | Depends on Task 1 |
| Wave 3 | Task 4 (verify + commit) | Final gate |
