# Intake Form Voice & Elements Update -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the intake form's tone and visual elements to match Karli's original Wix form voice, adding her personal intro, neurodivergent disclosure, QR code, photography/SMS consent notes, redirect note, and closing message.

**Architecture:** Pure UI/copy update to a single 1264-line page component (`page.tsx`), plus a pre-rendered QR code SVG static asset. No schema, API, or database changes. All 225 existing tests must remain green.

**Tech Stack:** Next.js 16 (App Router), React, Tailwind CSS 4, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-21-intake-form-voice-update-design.md`

---

## File Map

| File | Action | Responsibility |
| --- | --- | --- |
| `src/app/(public)/newclientform/page.tsx` | Modify | All copy/tone updates, intro replacement, pre-booking notes, redirect note, closing message |
| `public/images/karli-qr.svg` | Create | Pre-rendered QR code encoding Karli's vCard |

---

## Task 1: Verify Test Baseline

**Files:** None (verification only)

- [ ] **Step 1: Run tests to confirm 225 pass**

Run from `abhs/` directory:

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing. If not, stop and investigate before proceeding.

- [ ] **Step 2: Start dev server for visual checks**

```bash
cd c:/kar/abhs && npx next dev -p 3005
```

Visit `http://localhost:3005/newclientform` to see the current form state.

---

## Task 2: Generate QR Code SVG

**Files:**

- Create: `abhs/public/images/karli-qr.svg`

- [ ] **Step 1: Generate QR code**

Generate a QR code SVG encoding the following vCard:

```text
BEGIN:VCARD
VERSION:3.0
N:Rosario;Karli
FN:Karli Rosario
ORG:All Beauty Hair Studio
TEL;TYPE=CELL:+19515416620
END:VCARD
```

Use a one-time Node script or online QR generator. Save the output as `abhs/public/images/karli-qr.svg`.

- [ ] **Step 2: Verify QR code works**

Open `http://localhost:3005/images/karli-qr.svg` in a browser. Scan it with a phone camera. It should prompt to save a contact card for Karli Rosario, All Beauty Hair Studio, (951) 541-6620.

- [ ] **Step 3: Commit**

```bash
git add abhs/public/images/karli-qr.svg
git commit -m "feat: add Karli's vCard QR code for intake form"
```

---

## Task 3: Replace Personal Intro + Neurodivergent Disclosure

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:550-591`

This task replaces the existing intro section (lines 550-591) with Karli's full Wix form intro, neurodivergent disclosure, and QR code.

- [ ] **Step 1: Replace intro content**

Replace lines 550-591 (the `<div className="bg-blush-50/60 ...">` block through the "Let's Get Started" button and its closing divs) with the following:

```tsx
            <div className="bg-blush-50/60 rounded-2xl p-6 sm:p-10 border border-warm-100">
              <p className="text-warm-600 leading-relaxed mb-4">
                Hey there -- I&apos;m so glad you&apos;re here.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                This form helps me understand you, your hair, and how it fits into your real life.
                My approach is rooted in intentional design, low-maintenance results, and hair that
                grows out beautifully -- not hair that constantly asks more of you.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                Please fill this out as thoughtfully and honestly as possible. This allows me to
                recommend services that feel aligned, sustainable, and realistic for your lifestyle
                and maintenance preferences.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                <strong className="text-warm-700">Consultations are required</strong> for most color
                services and transformations.{' '}
                <strong className="text-warm-700">Haircut appointments</strong> do not require a
                separate consultation.
              </p>
              <p className="text-warm-600 leading-relaxed mb-6">
                I can&apos;t wait to learn more about you.
              </p>
              <p className="text-sm text-warm-500 italic mb-8">-- Karli</p>

              <div className="bg-white/70 rounded-xl p-4 sm:p-6 border border-warm-100">
                <p className="text-xs text-warm-500 leading-relaxed mb-3">
                  <Sparkles size={12} className="inline mr-1 text-copper-400" />
                  Your form will be reviewed within <strong>72 hours</strong>. As a neurodivergent
                  business owner, I truly appreciate a gentle follow-up if you haven&apos;t heard
                  back after a few days.
                </p>
                <div className="flex items-center gap-4">
                  <a href="tel:9515416620" className="text-copper-500 hover:text-copper-600 font-medium text-xs">
                    (951) 541-6620
                  </a>
                  <img
                    src="/images/karli-qr.svg"
                    alt="Scan to save Karli's contact info"
                    width={80}
                    height={80}
                    className="rounded border border-warm-100"
                  />
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px]"
                >
                  Let&apos;s Get Started
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
```

- [ ] **Step 2: Visual verification**

Visit `http://localhost:3005/newclientform` in browser. Verify:

- Karli's full intro paragraph displays
- Consultation vs haircut note is visible
- "-- Karli" signature shows
- 72-hour neurodivergent disclosure shows with Sparkles icon
- QR code image renders at ~80x80px
- Phone number link is clickable
- "Let's Get Started" button still works and enters the wizard
- Mobile responsive (check at 375px width)

- [ ] **Step 3: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing (no test touches intro copy).

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: replace intake intro with Karli's full Wix form voice + QR code"
```

---

## Task 4: Update Step 2 -- Hair Love/Hate Label

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:794-795`

- [ ] **Step 1: Update the label**

Find the label at line ~794-795:

```tsx
                    What do you love (or hate) about your hair right now?
```

Replace with:

```tsx
                    Please tell me what you love and hate about your hair currently?
```

- [ ] **Step 2: Visual verification**

Navigate to Step 2 of the wizard. Confirm the updated label text.

- [ ] **Step 3: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: update hair love/hate label to match Karli's Wix wording"
```

---

## Task 5: Update Step 4 -- Hair History Info Box

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:905-911`

- [ ] **Step 1: Replace the amber info box content**

Find the amber info box at lines ~905-911:

```tsx
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Important:</strong> If you&apos;ve had <em>anything</em> in your hair &mdash; box dye,
                    henna, bleach, keratin, anything &mdash; please mention it even if it was a while ago.
                    This helps me protect your hair and avoid surprises.
                  </p>
                </div>
```

Replace with:

```tsx
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    If you&apos;ve had <strong>ANYTHING</strong> in your hair -- box dye, henna, bleach,
                    keratin, anything -- please note that this will be brought up in the consultation.
                    Ya girls gotta know what she&apos;s working with!
                  </p>
                </div>
```

- [ ] **Step 2: Visual verification**

Navigate to Step 4. Verify the amber box shows Karli's voice with "Ya girls gotta know..."

- [ ] **Step 3: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: update hair history info box to Karli's Wix voice"
```

---

## Task 6: Update Step 5 -- Goals Helper Text

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:950-953`

- [ ] **Step 1: Replace the helper text**

Find the helper text at lines ~950-953:

```tsx
                  <p className="text-xs text-warm-400 mb-2">
                    A vibe, a specific look, a feeling, a problem you want solved &mdash; anything goes.
                    Think: &ldquo;I want to feel put together without trying hard&rdquo; or &ldquo;I want to go blonde but I&apos;m scared.&rdquo;
                  </p>
```

Replace with:

```tsx
                  <p className="text-xs text-warm-400 mb-2">
                    Examples: feeling put together, ease in the mornings, confidence, simplicity, a fresh
                    start, something that fits this season of your life. Something that feels a little more
                    like <em>me</em>.
                  </p>
                  <p className="text-xs text-warm-400 mb-2">
                    There is no right or wrong answer to this question. This just helps me to better
                    customize your look based on your expectations.
                  </p>
```

- [ ] **Step 2: Visual verification**

Navigate to Step 5. Verify the helper text matches Karli's Wix wording.

- [ ] **Step 3: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: update goals helper text to Karli's Wix wording"
```

---

## Task 7: Update Step 7 -- Medical Section + Pre-Booking Notes + Redirect Note + SMS Consent

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:1126-1168`

This task updates three things in Step 7: the medical section label/description, the pre-booking notes, and adds the redirect note.

- [ ] **Step 1: Update medical section heading and description**

Find lines ~1126-1127:

```tsx
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Almost Done!</h2>
                  <p className="text-sm text-warm-400 mb-6">Just a couple more things and you&apos;re all set.</p>
```

Replace with:

```tsx
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Almost Done!</h2>
                  <p className="text-sm text-warm-400 mb-6">We&apos;re one step closer to creating the hair of your dreams!</p>
```

- [ ] **Step 2: Update medical label and helper text**

Find lines ~1131-1138:

```tsx
                  <label htmlFor="medical_info" className="block text-sm font-medium text-warm-600 mb-1">
                    Anything medical or allergy-related I should know?{' '}
                    <span className="text-warm-400 text-xs">(optional)</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-2">
                    Postpartum changes, medications that affect hair, alopecia, scalp sensitivities,
                    latex allergies &mdash; anything that helps me take better care of you.
                  </p>
```

Replace with:

```tsx
                  <label htmlFor="medical_info" className="block text-sm font-medium text-warm-600 mb-1">
                    Things I might need to know{' '}
                    <span className="text-warm-400 text-xs">(optional)</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-2">
                    Please tell me any additional information you feel might be important for me to know
                    before your appointment. Be as detailed as possible.
                  </p>
                  <p className="text-xs text-warm-400 mb-2">
                    All these things play a big role in creating your hair goals (example: additional hair
                    history, postpartum and covid hair loss, cancer, thyroid and depression medications, as
                    well as allergies, alopecia, eczema and psoriasis)
                  </p>
```

- [ ] **Step 3: Replace pre-booking notes**

Find lines ~1159-1168 (the "Before We Book" section):

```tsx
                {/* Before-booking info */}
                <div className="bg-blush-50 rounded-xl p-5 border border-warm-100 space-y-3">
                  <h3 className="text-sm font-medium text-warm-700">Before We Book</h3>
                  <ul className="text-xs text-warm-500 space-y-2 leading-relaxed">
                    <li>&bull; My hourly rate starts at <strong className="text-warm-600">$75/hr</strong> &mdash; pricing depends on time and complexity, not a flat menu</li>
                    <li>&bull; I work <strong className="text-warm-600">Tuesday through Thursday, 10am&ndash;7pm</strong></li>
                    <li>&bull; I take my time. Every appointment is designed for <strong className="text-warm-600">intentional results</strong>, not speed</li>
                    <li>&bull; By submitting this form, you consent to me using photos from our session for portfolio/social media purposes (I&apos;ll always ask before posting)</li>
                  </ul>
                </div>
```

Replace with:

```tsx
                {/* Before-booking info */}
                <div className="bg-blush-50 rounded-xl p-5 border border-warm-100 space-y-3">
                  <h3 className="text-sm font-medium text-warm-700">Before booking, please note:</h3>
                  <ul className="text-xs text-warm-500 space-y-2 leading-relaxed">
                    <li>&bull; All services are charged at an hourly rate</li>
                    <li>&bull; Appointments are available <strong className="text-warm-600">Tuesday--Thursday, 10am--7pm</strong></li>
                    <li>&bull; My work focuses on intentional, low-maintenance results designed to grow out well</li>
                    <li>&bull; I photograph and film most clients, but your privacy is always respected</li>
                    <li>&bull; By submitting this form, you consent to me using photos from our session for portfolio/social media purposes (I&apos;ll always ask before posting)</li>
                    <li>&bull; By submitting this form, you agree to receive text message notifications. You can stop these at any time.</li>
                  </ul>
                  <p className="text-xs text-warm-500 leading-relaxed pt-2 border-t border-warm-100">
                    Upon submitting the form, you will be redirected to Karli&apos;s calendar to book your appointment!
                  </p>
                </div>
```

- [ ] **Step 4: Visual verification**

Navigate to Step 7. Verify:

- "Things I might need to know" label
- Updated helper text with Karli's examples
- "Before booking, please note:" heading
- All 6 bullet points display (hourly rate, hours, intentional results, photography, photo consent, SMS consent)
- Redirect note shows below the bullets
- Consent checkbox still works

- [ ] **Step 5: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 6: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: update Step 7 medical label, pre-booking notes, and add redirect/SMS consent"
```

---

## Task 8: Add Closing Message to Reassurance Section

> **Note:** The spec says "on the success/redirect screen" but the form redirects instantly to `/book` via `router.push('/book')` -- there is no post-submit screen. Placing this in the reassurance footer (visible while filling out the form) is the best fit without adding a delay or interstitial page. The "We're one step closer to creating the hair of your dreams!" subtitle in Step 7 also reinforces the warm closing energy.

**Files:**

- Modify: `abhs/src/app/(public)/newclientform/page.tsx:1251-1258`

- [ ] **Step 1: Update the reassurance section**

Find lines ~1251-1258 (the reassurance section after the form):

```tsx
          {/* Reassurance */}
          <div className="mt-10 pt-8 border-t border-warm-100 text-center">
            <FloralBloom className="w-5 h-5 text-warm-300 mx-auto mb-3" />
            <p className="text-xs text-warm-400 leading-relaxed max-w-sm mx-auto">
              Your information stays between us. I use this to prepare for our
              consultation so we can make the most of our time together.
            </p>
          </div>
```

Replace with:

```tsx
          {/* Reassurance */}
          <div className="mt-10 pt-8 border-t border-warm-100 text-center">
            <FloralBloom className="w-5 h-5 text-warm-300 mx-auto mb-3" />
            <p className="text-sm text-warm-600 leading-relaxed max-w-sm mx-auto mb-2">
              Thank you for trusting me with your hair -- I don&apos;t take that lightly.
            </p>
            <p className="text-xs text-warm-400 leading-relaxed max-w-sm mx-auto">
              Your information stays between us. I use this to prepare for our
              consultation so we can make the most of our time together.
            </p>
          </div>
```

- [ ] **Step 2: Visual verification**

Scroll to the bottom of the form (any step). Verify Karli's closing message appears above the privacy reassurance.

- [ ] **Step 3: Run tests**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 4: Commit**

```bash
git add abhs/src/app/\(public\)/newclientform/page.tsx
git commit -m "feat: add Karli's closing message to intake form"
```

---

## Task 9: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
cd c:/kar/abhs && npx vitest run
```

Expected: 225 tests passing.

- [ ] **Step 2: Full visual walkthrough**

Walk through the entire form on dev server (`http://localhost:3005/newclientform`):

1. Landing page -- intro, neurodivergent note, QR code, "Let's Get Started"
2. Step 1 -- About You (no changes, verify unchanged)
3. Step 2 -- "Please tell me what you love and hate about your hair currently?"
4. Step 3 -- Hair Personality (no changes, verify unchanged)
5. Step 4 -- Hair History amber box with "Ya girls gotta know..."
6. Step 5 -- Goals helper text with Karli's examples
7. Step 6 -- Photos (no changes, verify unchanged)
8. Step 7 -- "Things I might need to know", updated pre-booking notes with 6 bullets, redirect note, consent checkbox
9. Bottom of form -- closing message "Thank you for trusting me with your hair"

- [ ] **Step 3: Mobile check**

Verify at 375px viewport width:

- Intro text wraps cleanly
- QR code doesn't overflow
- All steps readable

- [ ] **Step 4: Accessibility check**

- Tab through all interactive elements -- focus indicators visible
- QR code img has alt text
- Contrast on all new text meets 4.5:1

---

## Summary

| Task | Description | Files |
| --- | --- | --- |
| 1 | Verify test baseline | (none) |
| 2 | Generate QR code SVG | `public/images/karli-qr.svg` |
| 3 | Replace intro + neurodivergent disclosure | `page.tsx:550-591` |
| 4 | Update hair love/hate label | `page.tsx:794-795` |
| 5 | Update hair history info box | `page.tsx:905-911` |
| 6 | Update goals helper text | `page.tsx:950-953` |
| 7 | Update Step 7 medical + pre-booking + redirect + SMS | `page.tsx:1126-1168` |
| 8 | Add closing message | `page.tsx:1251-1258` |
| 9 | Final verification | (none) |
