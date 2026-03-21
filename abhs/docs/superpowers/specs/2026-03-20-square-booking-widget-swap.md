# Square Booking Widget Swap - Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Authors:** Bas & Claude

## Context

Karli has an active loan through Square, requiring her to use Square's booking system until the loan is paid off. The custom 3-step booking wizard built into ABHS needs to be temporarily replaced with Square's embedded appointment widget. All custom booking code is preserved in the repo for future restoration.

## Goals

1. Replace the custom booking wizard UI with Square's embedded appointment widget
2. Wrap the widget in ABHS branding so it feels native to the site
3. Direct new clients to booking after completing the intake form
4. Preserve all custom booking code and backend APIs for future swap-back
5. Zero impact on admin functionality (calendar, approval queue, etc.)

## Non-Goals

- Modifying any booking backend APIs
- Changing the admin calendar or approval queue
- Removing or refactoring any custom booking component files
- Changing navigation structure

## Design

### 1. `/book` Page (`src/app/(public)/book/page.tsx`)

**Current:** Server component rendering `<BookingWizard />`

**New:** Server component page (preserves metadata export) importing a `SquareBookingWidget` client component.

Structure:
```
page.tsx (server component -- exports metadata)
  +-- Branded header section
  |     +-- FloralBloom accent
  |     +-- "Book Your Appointment" heading
  |     +-- Warm subtext in Karli's voice
  +-- <SquareBookingWidget /> (client component)
  |     +-- Styled wrapper (rounded corners, soft shadow, cream bg)
  |     +-- "Loading booking..." fallback while script loads
  |     +-- Square script injected via useEffect into container div
  +-- FloralDivider footer accent
```

**New file:** `src/components/booking/square-booking-widget.tsx`
- `"use client"` component
- `useEffect` creates a `<script>` element with `src` pointing to Square's widget JS
- Script appended to a ref'd container div
- Loading state shown until widget renders
- Cleanup removes the script tag on unmount (best-effort -- Square's injected DOM nodes are cleaned up by React unmounting the container)

**Square script URL:**
```
https://square.site/appointments/buyer/widget/2259437d-19ba-481d-b498-c2741eb33ded/A539718ADD7GC.js
```

**Metadata:** Exported from server page.tsx (existing pattern, no conflicts).

### 2. Intake Form Success Screen (`src/app/(public)/newclientform/page.tsx`)

**Current:** "You're All Set!" message with "Back to Home" link.

**New:** Add a "Ready to Book?" CTA button pointing to `/book`, placed between Karli's sign-off and the "Back to Home" link. Styled consistently with the site's forest-500 button pattern.

The existing success message stays exactly as-is. The new button is additive.

### 3. Homepage CTAs

**No changes.** Both buttons already route correctly:
- "New Here? Let's Talk" -> `/newclientform`
- "Already a Client? Book Here" -> `/book`

### 4. CSP Update (`next.config.ts`)

Square's widget loads external scripts and likely creates an iframe. The Content Security Policy needs:

| Directive | Value | Reason |
|-----------|-------|--------|
| `script-src` | add `https://square.site` | Widget JS file |
| `frame-src` | add `'self' https://square.site` | Widget iframe (new directive, include 'self' for fallback) |
| `connect-src` | add `https://square.site` | Widget API calls |
| `style-src` | add `https://square.site` | Widget may load external stylesheets |

**Note:** Square's widget may make API calls to additional Square domains (e.g., `connect.squareup.com`, `api.squareup.com`). During manual testing, check the browser console for CSP violations and add any additional domains as needed.

### 5. Files Modified

| File | Change |
|------|--------|
| `src/app/(public)/book/page.tsx`            | Replace BookingWizard with branded wrapper + SquareBookingWidget |
| `src/components/booking/square-booking-widget.tsx` | New client component for Square script injection |
| `src/app/(public)/newclientform/page.tsx`   | Add "Ready to Book?" CTA to success screen |
| `next.config.ts`                            | Add `square.site` to CSP directives |

### 6. Files NOT Modified

- `src/components/booking/*` -- all custom booking wizard components preserved
- `src/app/api/booking/*` -- all public booking API routes preserved
- `src/app/api/admin/bookings/*` -- all admin booking API routes preserved
- `src/app/admin/(dashboard)/calendar/*` -- admin calendar preserved
- `src/lib/booking-requests.ts` -- approval queue logic preserved
- `src/lib/booking-validation.ts` -- validation logic preserved
- `src/lib/square.ts` -- Square SDK client preserved
- All test files -- 225 tests remain passing

### 7. Swap-Back Plan

When Karli pays off the Square loan, restoration is a single-page change:

1. Revert `src/app/(public)/book/page.tsx` to render `<BookingWizard />`
2. Remove `square.site` from CSP in `next.config.ts`
3. Optionally remove the booking CTA from intake success screen
4. All backend APIs and admin features are already live -- zero backend work needed

## Security Considerations

- Square's widget script is loaded from `https://square.site` -- a trusted first-party Square domain
- CSP additions are scoped to `square.site` only -- no wildcards
- `X-Frame-Options: DENY` stays for our pages -- only Square's iframe within our page is permitted via `frame-src`
- No credentials or tokens are exposed client-side -- the widget handles its own auth

## Testing

- Existing 225 tests pass unchanged (no backend or component logic modified)
- Manual verification: load `/book`, confirm widget renders, confirm branded wrapper displays
- Manual verification: complete intake form, confirm "Ready to Book?" CTA appears and links to `/book`
- Manual verification: CSP doesn't block Square widget in browser console
