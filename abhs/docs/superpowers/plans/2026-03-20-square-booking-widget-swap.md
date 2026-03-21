# Square Booking Widget Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Temporarily replace the custom booking wizard UI with Square's embedded appointment widget while preserving all custom code for future restoration.

**Architecture:** Server component page imports a client component that injects Square's widget script via useEffect. Branded wrapper surrounds the widget. Intake form success screen gets a new CTA to direct clients to booking.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Lucide React icons

**Spec:** `docs/superpowers/specs/2026-03-20-square-booking-widget-swap.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/booking/square-booking-widget.tsx` | Create | Client component -- injects Square script, shows loading state |
| `src/app/(public)/book/page.tsx` | Modify | Server page -- branded wrapper, imports SquareBookingWidget |
| `src/app/(public)/newclientform/page.tsx` | Modify | Add "Ready to Book?" CTA to success screen |
| `next.config.ts` | Modify | Add square.site to CSP directives |

---

### Task 1: Update CSP for Square Widget

**Files:**
- Modify: `next.config.ts:44-53`

- [ ] **Step 1: Add Square domains to CSP directives**

In `next.config.ts`, update the Content-Security-Policy header value array:

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://square.site",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://square.site",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "media-src 'self' https://*.cdninstagram.com https://*.fbcdn.net",
    "connect-src 'self' https://square.site",
    "frame-src 'self' https://square.site",
    "frame-ancestors 'none'",
  ].join('; '),
},
```

- [ ] **Step 2: Verify tests still pass**

Run: `npx vitest run`
Expected: 225 tests passing (CSP change is config-only, no test impact)

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add Square widget domains to CSP headers"
```

---

### Task 2: Create SquareBookingWidget Client Component

**Files:**
- Create: `src/components/booking/square-booking-widget.tsx`

- [ ] **Step 1: Create the client component**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

const SQUARE_WIDGET_URL =
  'https://square.site/appointments/buyer/widget/2259437d-19ba-481d-b498-c2741eb33ded/A539718ADD7GC.js';

export function SquareBookingWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = SQUARE_WIDGET_URL;
    script.async = true;
    script.onload = () => setLoading(false);
    script.onerror = () => { setLoading(false); setError(true); };
    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 min-h-[400px]">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-warm-400 text-sm">Loading booking...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-warm-500 text-sm">
              Booking is temporarily unavailable. Please call us to schedule.
            </p>
          </div>
        )}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tests still pass**

Run: `npx vitest run`
Expected: 225 tests passing (new file, no existing tests affected)

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/square-booking-widget.tsx
git commit -m "feat: add SquareBookingWidget client component"
```

---

### Task 3: Update Book Page with Branded Wrapper

**Files:**
- Modify: `src/app/(public)/book/page.tsx`

- [ ] **Step 1: Replace page content**

Replace the entire contents of `src/app/(public)/book/page.tsx`:

```tsx
// TEMPORARY: Square widget swap. Custom BookingWizard preserved in
// src/components/booking/. See docs/superpowers/specs/2026-03-20-square-booking-widget-swap.md
// for swap-back plan.
import type { Metadata } from 'next';
import { FloralBloom, FloralDivider } from '@/components/decorative/floral-accents';
import { SquareBookingWidget } from '@/components/booking/square-booking-widget';

export const metadata: Metadata = {
  title: 'Book an Appointment | All Beauty Hair Studio',
  description:
    'Book your next hair appointment with Karli at All Beauty Hair Studio in Wildomar, CA.',
};

export default function BookPage() {
  return (
    <div className="flex flex-col">
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-10">
          <FloralBloom className="w-8 h-8 text-forest-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-4">
            Book Your Appointment
          </h1>
          <p className="text-warm-500 leading-relaxed max-w-lg mx-auto">
            Pick a time that works for you and I&apos;ll see you in the chair.
          </p>
        </div>
        <SquareBookingWidget />
      </section>
      <FloralDivider className="py-6 text-forest-500" />
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server renders the page**

Open: `http://localhost:3005/book`
Expected: Branded header with FloralBloom, heading, subtext, Square widget loading below

- [ ] **Step 3: Check browser console for CSP violations**

Open browser DevTools > Console on `/book` page.
Expected: No CSP errors. If Square loads additional domains, note them for Task 5.

- [ ] **Step 4: Verify tests still pass**

Run: `npx vitest run`
Expected: 225 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/book/page.tsx
git commit -m "feat: replace booking wizard with Square widget + branded wrapper"
```

---

### Task 4: Add Booking CTA to Intake Success Screen

**Files:**
- Modify: `src/app/(public)/newclientform/page.tsx:523-557`

- [ ] **Step 1: Add CTA button to success screen**

In `src/app/(public)/newclientform/page.tsx`, find the success screen section (the `if (status === 'success')` block). Add a "Ready to Book?" button between the `<p>` with Karli's sign-off and the `<FloralDivider>`.

Replace:
```tsx
            <p className="text-sm text-warm-400 italic">&mdash; Karli</p>
            <FloralDivider className="text-forest-500 mt-10" />
```

With:
```tsx
            <p className="text-sm text-warm-400 italic">&mdash; Karli</p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium min-h-[48px] shadow-md text-base"
            >
              <Calendar size={18} />
              Ready to Book?
            </Link>
            <FloralDivider className="text-forest-500 mt-10" />
```

- [ ] **Step 2: Verify imports**

Check the existing imports at the top of the file. `Link` from `next/link` should already be imported (line 5). `Calendar` from `lucide-react` may not be imported. If missing, add it to the existing Lucide import line:

```tsx
import { CheckCircle, ArrowRight, ArrowLeft, Send, Upload, X, Camera, Sparkles, Calendar } from 'lucide-react';
```

- [ ] **Step 3: Verify dev server renders the success screen**

Submit the intake form (or temporarily set status to 'success' in code) and verify the "Ready to Book?" button appears and links to `/book`.

- [ ] **Step 4: Verify tests still pass**

Run: `npx vitest run`
Expected: 225 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/newclientform/page.tsx
git commit -m "feat: add booking CTA to intake form success screen"
```

---

### Task 5: Manual Testing and CSP Tuning

**Files:**
- Possibly modify: `next.config.ts` (if additional CSP domains needed)

- [ ] **Step 1: Test the full flow -- new client**

1. Go to `http://localhost:3005`
2. Click "New Here? Let's Talk" -- should go to `/newclientform`
3. (After intake submission) "Ready to Book?" button should appear
4. Click it -- should go to `/book` with Square widget

- [ ] **Step 2: Test the full flow -- returning client**

1. Go to `http://localhost:3005`
2. Click "Already a Client? Book Here" -- should go to `/book`
3. Square widget should render inside the branded wrapper

- [ ] **Step 3: Check browser console for CSP violations**

Open DevTools > Console on `/book`. Look for errors like:
- `Refused to load the script` -- add domain to `script-src`
- `Refused to frame` -- add domain to `frame-src`
- `Refused to connect` -- add domain to `connect-src`
- `Refused to apply inline style` -- check `style-src`

Common additional Square domains that may need adding:
- `https://connect.squareup.com`
- `https://api.squareup.com`
- `https://pci-connect.squareup.com`

If any CSP violations found, add the domains to the appropriate directive in `next.config.ts`.

- [ ] **Step 4: Verify admin calendar still works**

1. Log into `/admin`
2. Navigate to Calendar
3. Confirm all views render (year/month/week/day)
4. Confirm booking management features work

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: 225 tests passing

- [ ] **Step 6: Commit CSP fixes (if any)**

```bash
git add next.config.ts
git commit -m "fix: add additional Square domains to CSP"
```

Skip this step if no CSP changes were needed.

---

### Task 6: Production Build Verification

- [ ] **Step 1: Run production build**

Run: `npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Verify no type errors**

Check build output for TypeScript errors. Expected: 0 errors.

- [ ] **Step 3: Final commit (if any cleanup needed)**

If build revealed any issues that required fixes, commit specific files:

```bash
git add <specific-files-that-changed>
git commit -m "fix: address build issues from Square widget swap"
```
