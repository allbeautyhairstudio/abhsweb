# Admin Intake Detail Page Redesign -- Design Spec

> **Goal:** Redesign the admin intake detail page to be ADHD-friendly, accessible, and capacity-aware for Karli's 3-day work week. Surface what matters first, flag gaps visually, keep all Q&A data accessible.

**Approved mockup:** `public/mockup.html` (accessible at `/mockup.html` on dev server)

---

## Problem

The current intake detail page is a single long-scrolling Q&A list where every section has equal visual weight. Karli has ADHD and EDS -- she needs to review intakes quickly, spot what matters, identify missing info, and act on it. Currently she has to read everything to find the important parts, and missing/sparse answers are invisible unless she reads every field.

When clients submit incomplete or sparse intakes, Karli spends significant time crafting follow-up messages to get the information she needs. This is her biggest time sink.

## Solution

Replace the single-scroll layout with a **3-tab interface**:

1. **At a Glance** (default) -- critical info at a glance, gap summary with action buttons
2. **Full Intake** -- every Q&A with inline gap flagging
3. **Photos** -- dedicated photo gallery

### Design Principles (ADHD/UD)

- **Visual hierarchy:** Most important info has the most visual weight
- **Chunking:** Small, focused cards instead of long lists
- **Color coding:** Amber for missing/sparse, red for health/safety, green for good fit
- **Progressive disclosure:** Summary first, detail on demand
- **Action proximity:** "Draft Follow-Up" buttons right next to the gaps they address

---

## Tab 1: At a Glance (Default)

Card-based grid layout showing the most decision-relevant information.

### Cards (in order):

1. **What They Want** (full width)
   - Client's goal in their own words, displayed prominently with italic styling
   - This is the single most important piece of info for Karli

2. **Hair Profile** (half width)
   - 2x2 grid: Texture, Length, Density, Maintenance Frequency
   - Condition tags below: all condition values are concern indicators (amber tags)
   - If no condition issues reported, show a single green "Healthy" tag

3. **Availability** (half width)
   - Show availability slot tags from intake data (e.g. "Tue Morning", "Wed Afternoon", "Flexible")
   - All current form options fall within Karli's Tue-Thu schedule, so all tags are green
   - "Flexible" shown with a distinct style (green, slightly different shade)
   - Legacy data with non-matching days shown in red

4. **Photos Preview** (half width)
   - Horizontal scroll of thumbnails (80x80)
   - "+N more" button links to Photos tab
   - If no photos: "No photos submitted" placeholder

5. **Current Products** (half width)
   - Simple label: value list for submitted products
   - Only shows products the client actually listed

6. **Missing Information** (full width, only shown when gaps exist)
   - Count badge (amber)
   - List of missing/sparse fields with indicators:
     - "Missing" (amber) -- field was left empty or not answered
     - "Sparse" (amber) -- answer is too short to be useful (free-text fields only)
   - Two action buttons:
     - **"Draft Email Follow-Up"** -- opens AI chat panel with email channel pre-selected and a prompt asking for the specific missing information
     - **"Draft SMS Follow-Up"** -- opens AI chat panel with SMS channel pre-selected and the same prompt
   - **"View in Full Intake"** link -- switches to Full Intake tab

7. **All Information Received** (full width, only shown when zero gaps)
   - Green checkmark with "All information received" text
   - Gives Karli immediate positive confirmation that the intake is complete

### Gap Detection Logic

Gap detection applies to all intake records, including those submitted before the options alignment update (March 21, 2026). Older intakes may have null values for fields that are now required on the form.

**Field type partitioning:**

- **Enum/select fields** (can only be "missing", never "sparse"):
  Hair texture, Hair length, Hair density, Styling description, Daily routine, Shampoo frequency, Maintenance frequency, Color reaction

- **Array/multi-select fields** (can only be "missing" if empty array, never "sparse"):
  Service interest, Hair condition, Hair history, Availability

- **Free-text fields** (can be "missing" or "sparse"):
  Hair love/hate, What they want, Referral source

- **Optional fields** (never flagged):
  Pronouns, Medical/additional info

**Sparse detection (free-text fields only):**
- Text fields with fewer than 10 characters are flagged as "Sparse"
- Known low-effort answers flagged as "Sparse": "fine", "idk", "good", "ok", "none", "na", "n/a", "nothing", "yes", "no", "dunno", "same", "idc"
- Stored as a constant array in the gap detection utility for easy extension

---

## Tab 2: Full Intake

Every Q&A from the intake form, organized by section with inline gap flagging.

### Sections:
1. About You (name, pronouns, email, phone, preferred contact)
2. Your Hair (love/hate, services, texture, length, density, condition)
3. Hair Personality & Routine (styling description, daily routine, shampoo frequency)
4. Hair History (treatments, color reaction, products)
5. Goals & Schedule (what they want, maintenance frequency, availability)
6. Things I Might Need to Know (medical info, referral source)

### Gap flagging (inline):
- **Missing answers:** Amber left-border highlight on the Q&A pair, answer shows "-- Missing --" in italic amber text
- **Sparse answers:** Amber left-border highlight, answer shown with a warning icon and "Sparse answer" label
- **Health/safety flags:** Red left-border highlight for color reaction symptoms reported (Itching, Burning, Swelling, etc.) or medical info present (these aren't gaps -- they're attention flags)
- **Optional fields:** Show "(Optional)" label after the question, no flag if empty

### Badge on tab:
- The "Full Intake" tab shows a count badge (amber) with the number of gaps

---

## Tab 3: Photos

Dedicated photo gallery with clear separation.

### Layout:
- **Selfies section:** Grid of selfie photos with "Selfies" heading
- **Inspiration section:** Grid of inspiration photos with "Inspiration" heading
- Each photo is clickable for zoom (uses existing lightbox component)
- If no photos: centered "No photos submitted" message

### Badge on tab:
- The "Photos" tab shows a count badge with the number of photos (e.g. "Photos (5)")
- If no photos, no badge

---

## Header Card (Always Visible, Above Tabs)

The existing header card stays above the tabs (not inside any tab). Contains:
- Client name, contact actions, status badge, referral source
- Overall rating badge (Ready to Book / Review Needed / Heads Up)
- AI flags and highlights

No changes to header card structure -- it already works well.

---

## AI Chat Integration

The "Draft Email Follow-Up" and "Draft SMS Follow-Up" buttons in the gap summary card need to programmatically control the chat panel.

### Required refactor: IntakeChatPanel imperative API

The current `IntakeChatPanel` manages all state internally via `useState`. To support programmatic open/channel/prompt from parent components, expose an imperative handle via `useImperativeHandle` + `forwardRef`:

```typescript
interface IntakeChatPanelRef {
  openWithDraft(channel: 'sms' | 'email', prompt: string): void;
}
```

The `openWithDraft` method:
1. Opens the chat panel (`isOpen = true`)
2. Enables draft mode (`isDraftMode = true`)
3. Sets the channel (`channelContext = channel`)
4. Sends the prompt through the existing `sendMessage` flow

### Button behavior:

- **"Draft Email Follow-Up"** calls `chatRef.current.openWithDraft('email', prompt)`
- **"Draft SMS Follow-Up"** calls `chatRef.current.openWithDraft('sms', prompt)`
- Prompt template: `"Draft a {channel} follow-up to {client_name} asking for the following missing information: {list of missing fields}. Keep it warm, professional, and in my voice."`

No new API endpoints needed -- uses existing chat infrastructure.

---

## Technical Approach

### Files to modify:
- `src/app/admin/(dashboard)/intake/[id]/page.tsx` -- restructure into tabs, pass data to tab components
- `src/components/salon/intake-chat-panel.tsx` -- add `forwardRef` + `useImperativeHandle` for `openWithDraft`

### New files:
- `src/components/salon/intake-glance-tab.tsx` -- At a Glance tab component
- `src/components/salon/intake-full-tab.tsx` -- Full Intake tab component with gap flagging
- `src/components/salon/intake-photos-tab.tsx` -- Photos tab component
- `src/components/salon/intake-gap-summary.tsx` -- Gap summary card with draft buttons
- `src/lib/intake-gaps.ts` -- Pure gap detection function + types, fully unit-testable
- `src/lib/intake-gaps.test.ts` -- Tests for gap detection

### Gap detection:
- Pure function: `detectIntakeGaps(intake: ParsedSalonIntake): GapResult[]`
- Returns array of `{ field: string, label: string, type: 'missing' | 'sparse', value?: string }`
- Lives in `src/lib/intake-gaps.ts`, matching existing pattern (`salon-summary.ts` holds pure logic)
- Sparse word list as exported constant `SPARSE_ANSWERS` for easy extension

### No database changes. No API changes. No public-facing changes.

---

## Mobile

- Tabs display full-width on mobile with abbreviated labels ("Glance" / "Full" / "Photos")
- Card grid collapses to single column on mobile
- Photo thumbnails remain horizontal-scrollable
- Touch targets minimum 44px on all interactive elements

---

## Accessibility

- Tabs use shadcn/ui Tabs component (Radix UI) -- keyboard navigation and ARIA built in
- Color is never the only indicator (text labels accompany all color codes)
- Touch targets minimum 44px
- All images have alt text
- Contrast ratios 4.5:1 minimum on all text

---

## What This Does NOT Include

- Public intake form validation changes (separate spec)
- New required fields on the form
- Changes to the AI summary scoring engine
- Database schema changes
- Print/PDF view (separate future work -- tab layout will need `@media print` rules)
