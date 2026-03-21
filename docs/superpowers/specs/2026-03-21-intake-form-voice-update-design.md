# Intake Form Voice & Elements Update -- Design Spec

**Date:** 2026-03-21
**Project:** All Beauty Hair Studio (ABHS)
**Scope:** UI/copy update to the new client intake form
**Files affected:** `src/app/(public)/newclientform/page.tsx` + new QR SVG component

---

## Goal

Bring the intake form's tone and personality in line with Karli's original Wix form and the warmth of the rest of the ABHS website. Add missing elements from the Wix form. No schema, API, or database changes.

---

## What Changes

### 1. Personal Intro (Before "Let's Get Started")

**Replace** the existing intro content (lines ~550-578 of `page.tsx`) with Karli's full warm opening. The current intro already has partial overlap (greeting, consultation note, 72-hour callout, phone link). This replaces all of it with the complete Wix version:

> Hey there -- I'm so glad you're here.
>
> This form helps me understand you, your hair, and how it fits into your real life. My approach is rooted in intentional design, low-maintenance results, and hair that grows out beautifully -- not hair that constantly asks more of you.
>
> Please fill this out as thoughtfully and honestly as possible. This allows me to recommend services that feel aligned, sustainable, and realistic for your lifestyle and maintenance preferences.
>
> Consultations are required for most color services and transformations.
> Haircut appointments do not require a separate consultation.
>
> I can't wait to learn more about you. -- Karli

### 2. Neurodivergent Disclosure + QR Code

**Replace** the existing 72-hour callout and phone link (lines ~565-578 of `page.tsx`) with the updated version that includes the QR code:

> Your form will be reviewed within 72 hours. As a neurodivergent business owner, I truly appreciate a gentle follow-up if you haven't heard back after a few days.
>
> 951-541-6620 | [QR code to save contact]

- QR code: pre-rendered SVG file at `public/images/karli-qr.svg` (primary approach -- static vCard, no runtime cost, no encoding complexity)
- vCard data: Karli Rosario, All Beauty Hair Studio, 951-541-6620
- Size: ~80x80px with subtle border in site palette
- Rendered via `<img>` tag or inlined SVG

### 3. Step Copy Updates

#### Step 2 -- Your Hair

- `hair_love_hate` label: "What do you love (or hate) about your hair right now?" --> "Please tell me what you love and hate about your hair currently?"

#### Step 4 -- Hair History

- Amber info box: "Important: If you've had anything in your hair -- box dye, henna, bleach, keratin, anything -- please mention it even if it was a while ago." --> "If you've had ANYTHING in your hair -- box dye, henna, bleach, keratin, anything -- please note that this will be brought up in the consultation. Ya girls gotta know what she's working with!"

#### Step 5 -- Goals & Schedule

- `what_you_want` helper text update: "Examples: feeling put together, ease in the mornings, confidence, simplicity, a fresh start, something that fits this season of your life. Something that feels a little more like me. There is no right or wrong answer to this question. This just helps me to better customize your look based on your expectations."

#### Step 7 -- Almost Done

- `medical_info` label: current --> "Things I might need to know"
- Step description: current --> "Please tell me any additional information you feel might be important for me to know before your appointment. Be as detailed as possible."
- Helper text: current --> "All these things play a big role in creating your hair goals (example: additional hair history, postpartum and covid hair loss, cancer, thyroid and depression medications, as well as allergies, alopecia, eczema and psoriasis)"

### 4. Pre-Booking Notes Update (Step 7)

Replace current notes (which mention $75/hr) with updated version combining Wix tone + explicit consent:

- All services are charged at an hourly rate
- Appointments are available Tuesday--Thursday, 10am--7pm
- My work focuses on intentional, low-maintenance results designed to grow out well
- I photograph and film most clients, but your privacy is always respected
- By submitting this form, you consent to me using photos from our session for portfolio/social media purposes (I'll always ask before posting)
- By submitting this form, you agree to receive text message notifications. You can stop these at any time.

### 5. Redirect Note

Add below the pre-booking notes, before the consent checkbox:

> Upon submitting the form, you will be redirected to Karli's calendar to book your appointment!

### 6. Closing Message

On the success/redirect screen after form submission:

> Thank you for trusting me with your hair -- I don't take that lightly.

---

## What Does NOT Change

- All existing questions remain (no removals)
- No new data fields or form inputs
- Zod validation schema unchanged
- API routes unchanged (`/api/intake`, `/api/intake/upload`)
- Database schema unchanged
- Photo upload flow unchanged
- 225 tests should remain green
- Step count stays at 7
- Step 1 (About You), Step 3 (Hair Personality & Routine), Step 6 (Show Me!) -- descriptions stay as-is (already in Karli's voice)

---

## QR Code Implementation

Pre-rendered SVG file. No runtime generation, no npm packages.

**Approach:** Generate a QR code SVG once from the vCard data using a one-time script or online tool, save as `public/images/karli-qr.svg`. Static file, zero runtime cost, zero encoding complexity.

**vCard payload:**

```text
BEGIN:VCARD
VERSION:3.0
N:Rosario;Karli
FN:Karli Rosario
ORG:All Beauty Hair Studio
TEL;TYPE=CELL:+19515416620
END:VCARD
```

**File:** `public/images/karli-qr.svg`

- Rendered via `<img>` tag with appropriate alt text ("Scan to save Karli's contact info")
- Size: ~80x80px display size
- Colors: dark modules in forest-800 (#1a3a2a or similar), light in white
- Subtle rounded border matching site aesthetic via CSS

---

## Testing Plan

- Run `npx vitest run` before and after -- all 225 tests must pass
- Visual verification on dev server (`npx next dev -p 3005`)
- Check each step of the wizard for updated copy
- Verify intro, neurodivergent disclosure, and QR code display on the landing screen
- Verify pre-booking notes, redirect note, and closing message
- Test mobile responsiveness of new elements
- Verify no accessibility regressions (contrast, focus, screen reader)

---

## Files Modified

| File | Change |
| --- | --- |
| `src/app/(public)/newclientform/page.tsx` | Intro, copy updates, pre-booking notes, redirect note, closing message |
| `public/images/karli-qr.svg` | NEW -- pre-rendered QR code for Karli's vCard |

---

## Out of Scope

- Adding new form fields or questions
- Removing existing questions (future curation session with Karli)
- Schema/API/DB changes
- Email lifecycle system (separate task, follows this one)
