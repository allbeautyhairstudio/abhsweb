# Spec A: Public Site Content & Visual Refresh

**Date:** 2026-03-22
**Status:** Approved
**Origin:** Karli Rosario's Website Strategy & Development Master List
**Scope:** Public-facing website content, footer, FAQ, mobile UX, image infrastructure, cut-forward positioning, Color Lab removal, client detail page rework

---

## 1. Footer Rewrite

### Current State

- Brand heading: "Karli Rosario" with floral icon
- Location: "The Colour Parlor" in Wildomar, CA
- Schedule: "By appointment only, 3 days per week"
- No phone number, no map link
- Quick links + legal links + LGBTQIA+ badge + Instagram
- Copyright: "Karli Rosario"

### Proposed Changes

**Brand column:**
- Heading changes from "Karli Rosario" to "All Beauty Hair Studio"
- Tagline stays as-is
- Floral icon stays

**Location & Hours column:**
- "Located inside The Colour Parlor" as secondary location detail
- Full street address hyperlinked to Google Maps (`https://maps.google.com/?q=...`)
- Google Maps link opens in new tab (`target="_blank" rel="noopener noreferrer"`)
- On mobile, the link triggers the native Maps app
- Schedule text: "By Appointment Only | Tuesday - Thursday" (replaces "3 days per week")

**Book Now column:** No change.

**Quick Links column:** No change.

**Bottom bar:**
- Copyright uses "All Beauty Hair Studio" instead of "Karli Rosario"
- LGBTQIA+ badge and Instagram icon stay

**No phone number on the site.** Communication goes through intake form and booking flow.

### Files Affected

- `src/components/layout/footer.tsx`

---

## 2. FAQ Additions & Updates

### Current State

8 questions covering: booking, first appointment, pricing, appointment length, location, cancellation, indecision, frequency. No payment methods, no schedule explanation, no Afterpay.

### New Questions (3)

**Q: "Why are you only available Tuesday through Thursday?"**
- Frame as intentional choice, not limitation
- Karli gives focused, high-energy sessions to each guest
- Dedicated one-on-one time means quality over quantity
- Empowering tone, not apologetic
- No mention of health conditions

**Q: "What payment methods do you accept?"**
- All major cards and digital payments accepted
- Cash welcomed and appreciated for supporting a small business (positive framing)
- Mention Afterpay is available for premium services

**Q: "Do you offer Afterpay?"**
- Yes, accepted through Square
- Positioned as accessibility for premium services
- Brief and confident

### Updated Question (1)

**Cancellation policy reword:**
- Current: "may have a fee" framing
- New: Reframe around mutual respect of a limited schedule
- 24-hour notice required
- Karli has limited appointment slots -- a no-show means another guest missed an opportunity
- Same policy, warmer reasoning

### Question Order

Insert schedule question near the location question (they're related). Payment and Afterpay go at the end before the "Still Have Questions?" CTA.

Final order:
1. How do I book an appointment?
2. What should I expect at my first appointment?
3. Why don't you list prices on the website?
4. How long do appointments typically take?
5. Where are you located?
6. Why are you only available Tuesday through Thursday? (NEW)
7. What's your cancellation policy? (UPDATED)
8. I don't know what I want -- is that okay?
9. How often will I need to come back?
10. What payment methods do you accept? (NEW)
11. Do you offer Afterpay? (NEW)

### Files Affected

- `src/app/(public)/faq/page.tsx`

---

## 3. Mobile Sticky "Book Now" Button

### Design

- Fixed bottom bar on mobile only (hidden above `md` / 768px breakpoint)
- Desktop already has green "Book" button in header nav -- no duplication needed
- Single button: "Book Now" linking to `/book`
- Full-width bar with padding
- Warm-700 or forest-500 background (consistent with existing CTAs)
- Slight top shadow to separate from page content
- Z-index above page content, below mobile nav drawer

### iPhone Safe Area

- `env(safe-area-inset-bottom)` padding (proven pattern from admin sticky bar)
- `viewport-fit=cover` already set in meta viewport from Session 2
- Button positioned above the safe area, not at absolute bottom

### Visibility Rules

- Visible on: Homepage, Gallery, Philosophy, FAQ, About, Legal pages
- Hidden on: `/book` (already there), `/newclientform` (in intake flow), `/admin/*` (admin dashboard)
- Implementation: `"use client"` component using `usePathname()` to check current route and conditionally render. Included in `src/app/(public)/layout.tsx` so it only appears on public pages (admin layout is separate).

### Accessibility

- 44px minimum touch target height
- 4.5:1 contrast ratio
- Keyboard accessible
- `prefers-reduced-motion` respected (no slide-in animation)

### Files Affected

- New component: `src/components/layout/mobile-sticky-cta.tsx`
- `src/app/(public)/layout.tsx` (add component to public layout)

---

## 4. Image Swap Points

### Context

Karli is getting new photos. No photos available yet. We design the swap to be trivial when they arrive.

### Swap Points

**Gallery header:**
- Currently: Unsplash stock image (haircare/salon theme)
- Action: Extract image source to a named constant in the gallery page
- When Karli's scissors/razor photo arrives: drop in `/public/images/`, update constant

**Homepage bottom banner:**
- Currently: `/scizzors.webp` with overlay
- Action: Extract to a named constant
- When "lived-in texture" or action shot arrives: drop in `/public/images/`, update constant

**Philosophy page:**
- Keeps `/scizzors.webp` as-is. No change.

### Deliverable

Swap infrastructure only. No visual changes. Existing images remain in place until replacements arrive.

### Files Affected

- `src/app/(public)/page.tsx` (homepage constant)
- `src/app/(public)/gallery/page.tsx` (gallery constant)

---

## 5. Cut-Forward Positioning & Messaging

### Philosophy

The site should communicate that Karli is a cutting specialist first. Color supports the cut, not the other way around. Every section should leave the visitor thinking "this is a cutting studio."

### Homepage Changes

**Hero:**
- "I design hair that works with your life" -- stays. Already cut-forward.

**"The Person Behind the Chair" section:**
- Shift emphasis to cutting craft, precision, intentional design
- Lead with her technical cutting expertise
- Add subtle "My Journey" text link at the end of the section (arrow icon, understated)
- Links to `/about` (Journey page stays hidden from nav but discoverable here)

**"What Makes This Different" 3-column grid:**
- Reframe to lead with cut craftsmanship
- Currently: "life-first approach, honesty, graceful grow-out"
- Shift to: cutting precision/structure first, then grow-out, then personal approach
- All copy positive-framed (what it IS, not what it isn't)

### Philosophy Page Changes

- Already aligns with cut-forward ("Intentional Hair Design")
- "How It Works in Practice" section: Ensure cutting is positioned as the foundation, color as enhancement
- Minor copy tweaks only

### Gallery Header Text

- Keep "My Work" as-is. Clean, simple, not trying too hard. The cut-forward positioning comes through in the work itself, not the header label.

### Tone Rules for All Copy

- Positive framing always -- lead with what it IS
- "designed to look good for weeks, designed to fit your life"
- "your cut continues to look intentional as it grows"
- "less time styling, more time living"
- No negative comparisons ("not just", "not worse", "no more")
- No em dashes
- Warm, confident, Karli's voice

### Files Affected

- `src/app/(public)/page.tsx` (homepage copy + My Journey link)
- `src/app/(public)/philosophy/page.tsx` (minor copy tweaks)
- `src/app/(public)/gallery/page.tsx` (header text evaluation)

---

## 6. Color Lab Full Removal

### Scope

Complete removal. No preservation, no hiding, no feature flags.

### What Gets Removed

| Layer | Target |
|-------|--------|
| Admin sidebar | Color Lab nav item |
| Admin pages | `src/app/admin/(dashboard)/color-lab/` directory |
| Components | `src/components/color/` directory |
| API routes | All endpoints under `src/app/api/color/` (7 route files, multiple HTTP methods) |
| DB queries | Color-related functions in `src/lib/queries/` |
| DB schema | `color_lines`, `color_shades`, `color_formulas`, `color_inventory` tables (DROP) |
| DB seed data | 8 brands, ~130 shades |
| Tests | `src/lib/color.test.ts` (48 tests) |
| Dashboard | Low Stock Alerts card on admin dashboard home |
| Client detail | Color History tab (tab 5 of 7) |
| Constants | Color brand data in `src/lib/constants/` |

### What Stays

- Client intake questions about color history/reactions (that's intake data)
- AI chat can still discuss color with clients
- Service descriptions for color bookings (that's Square/booking data)
- Color-related fields in the `clients` table (q-columns for intake answers)

### Test Impact

292 - 48 = ~244 tests remaining after removal. All remaining tests must pass.

### Files Affected

- `src/app/admin/(dashboard)/color-lab/` (DELETE directory)
- `src/components/color/` (DELETE directory)
- `src/app/api/color/` (DELETE directory)
- `src/lib/queries/color.ts` or similar (DELETE)
- `src/lib/constants/color-brands.ts` (DELETE)
- `src/lib/color.test.ts` (DELETE)
- `src/lib/schema.ts` (remove 4 CREATE TABLE statements)
- `src/app/admin/(dashboard)/page.tsx` (remove Low Stock Alerts card)
- `src/components/layout/sidebar.tsx` or similar (remove Color Lab nav item)
- `src/components/clients/client-detail-tabs.tsx` (remove Color History tab + AI Summary tab + Engagement tab)
- Grep for any remaining Color Lab imports across the codebase and remove

---

## 7. Client Detail Page Rework

### Current State

7 tabs on the client detail page (`/admin/clients/[id]`):
1. Overview -- Key Dates, Current Stage checklist, Client Overview (Pricing Tier, Referral Source, Testimonial), Client Photos
2. Intake Data -- full intake Q&A
3. AI Summary -- 3-axis scoring (readiness/complexity/engagement), flags, highlights
4. Bookings -- Square booking history
5. Color History -- formula timeline (Color Lab)
6. Engagement -- placeholder (Phase C, never built)
7. Notes & History -- CRUD notes with type filter

### Proposed: 4 Tabs

**Remove:**
- AI Summary tab (removed entirely -- AI assists through the chat panel, not a static score card)
- Color History tab (removed with Color Lab)
- Engagement tab (placeholder, never built, no value)

**Keep:**
1. **Overview** (enhanced)
2. **Intake Data** (stays as-is -- full Q&A detail)
3. **Bookings** (stays as-is -- Square booking history)
4. **Notes & History** (stays as-is -- CRUD notes)

### Enhanced Overview Tab

The Overview becomes Karli's one-stop view. No tab-hopping to get the full picture.

**Contact & Preferences (top of page, prominent):**
- Name, email, phone (already there)
- Preferred contact method highlighted with a badge or star (pull from intake `q05_contact_preference`)
- Pronouns displayed if provided

**Hair Profile Card (NEW):**
- Pull key intake answers directly onto Overview
- Texture (from intake)
- Length (from intake)
- Condition (from intake)
- Color history / current color situation (from intake)
- Goals -- what they want (from intake)
- Displayed as a clean, scannable card -- not the full Q&A, just the highlights Karli needs at a glance

**Stylist Notes (NEW -- ties to Spec B):**
- Karli's own technical assessment, editable inline
- Persists per client
- Same data shown in the AI chat panel
- Visible without opening the chat

**Visit Summary Card (NEW):**
- Last appointment date
- Next upcoming appointment
- Total visits count
- Data source: local `booking_requests` table (approved bookings) + live Square API call for confirmed bookings. Reuse existing booking query patterns from the calendar/client bookings endpoint.
- Compact card format -- click through to Bookings tab for full history

**Existing sections (stay):**
- Key Dates card
- Current Stage + checklist
- Client Photos

### Files Affected

- `src/app/admin/(dashboard)/clients/[id]/page.tsx` (tab restructure, enhanced Overview)
- Client detail components in `src/components/clients/` (new hair profile card, visit summary card)
- `src/lib/queries/` (query for visit summary data from Square/booking_requests)

---

## 8. AI-Generated Intake Summary (Replaces Rule-Based Scoring)

### Current State

The intake detail page (`/admin/intake/[id]`) shows a "What Karli Needs to Know" card at the top with:
- Overall badge (Ready to Book / Review Needed / Heads Up) from `salon-summary.ts`
- Flags (color correction, allergies, major change) -- rule-based detection
- 4-6 highlight bullets -- template-generated from intake fields

This is powered by `salon-summary.ts` -- a pure-function scoring engine with 3 axes (readiness/complexity/engagement). It's math, not intelligence.

### Proposed: Claude as Consultation Assistant

Replace the rule-based scoring with an on-demand AI-generated briefing. Claude reads the full intake and acts as Karli's consultation assistant -- like having a knowledgeable colleague who's already read the file and is briefing her before the client sits down.

**Generation flow:**
1. Karli opens intake detail page
2. First load: API call to Claude with full intake context
3. Claude generates a comprehensive briefing
4. Briefing cached in DB -- subsequent page views load instantly
5. If API unavailable: clean message "Summary unavailable -- review intake details below"
6. No fallback to rule-based scoring. If the API is down, Karli reads the Q&A herself.

**Briefing structure:**

- **Badge:** Ready to Book / Review Needed / Heads Up (Claude decides based on full intake read)

- **"Here's What I See"** -- Claude's full read on the client:
  - What their hair situation is and what they're working with (texture, condition, history, current state)
  - What they're asking for and whether it aligns with what's realistic given their hair
  - What Karli should prepare for (products, time estimates, techniques to consider)
  - Any considerations worth noting (reactions, medical history, complexity factors)
  - Suggested approach or conversation starters for the consultation

- **At a Glance** -- 3-5 key points for quick scanning when Karli is between clients

This is not a scorecard. It's a real, thoughtful briefing about THIS specific client based on THEIR specific answers. Claude reads between the lines -- noticing when someone says they want "low maintenance" but their goals describe something high-maintenance, or when a client's hair history suggests they may need education about realistic timelines.

The AI chat panel sits right beside this briefing. Karli can go deeper -- ask follow-up questions, get draft messages, explore options -- all in the same flow. The briefing is the starting point, the chat is the conversation.

**An artificial version of Claude sitting in the salon with Karli.**

Structured enough to scan. Intelligent enough to be useful. Insightful. Intentional. **Not overwhelming.**

**Brevity guardrail:** The briefing is concise and ADHD-friendly. No walls of text. "Here's What I See" is a short paragraph (3-5 sentences max), not an essay. Key points are 3-5 bullets, not 10. Claude surfaces what matters and trusts Karli to dig deeper through the chat if she wants more. The goal is calm clarity, not information overload.

**8 Pillars in the Summary Prompt:**

- **Non-Bias:** No assumptions based on name, referral source, or demographics. Judge readiness by what was shared, not who the client appears to be.
- **Inclusive:** Respect pronouns from intake. No gendered assumptions. No assumptions about family structure, identity, or lifestyle.
- **Security Minded:** Never expose raw medical data verbatim. Note "relevant medical history shared" without repeating details unnecessarily.
- **UX Minded:** Scannable, clear, actionable for Karli's workflow.
- **AI Ethics:** Summary is a tool for Karli's decision, not the decision itself. No "you should accept/decline" -- information to inform her judgment. Claude provides insight, Karli decides.
- **Performance:** Cache after first generation. No repeated API calls for the same intake.
- **Structure:** Consistent format every time -- badge, summary, key points.
- **Universal Design:** Summary language is plain and direct. No jargon.

**Cost:** ~$0.02 per intake at Claude Sonnet pricing. At 40 clients/month, ~$0.80/month.

### Rule-Based Scoring Engine Removal

**Full removal of:**
- `src/lib/salon-summary.ts` (scoring engine)
- `src/lib/salon-summary.test.ts` (73 tests)
- `src/lib/constants/salon-scoring-rules.ts` (scoring thresholds and rules)
- All references to `assessSalonIntake()`, `generateHighlights()`, `detectFlags()` across the codebase
- "What Karli Needs to Know" card replaced with AI summary card on intake detail page

**Test impact:** 292 - 73 (scoring) - 48 (color) = ~171 tests remaining. New tests added for AI summary caching and prompt construction.

**Chat context update:** `chat-context.ts` currently includes `formatSummaryForContext()` which formats the rule-based scores. This should be updated to include the AI-generated summary instead, or removed if the chat can generate its own read.

### Caching

- New DB table or column to store generated summaries per client
- Fields: client_id, badge, summary_text, key_points (JSON), generated_at
- Cache invalidated if intake data is modified (rare but possible)
- No TTL -- summary is valid as long as intake data hasn't changed

### Files Affected

- `src/lib/salon-summary.ts` (DELETE)
- `src/lib/salon-summary.test.ts` (DELETE)
- `src/lib/constants/salon-scoring-rules.ts` (DELETE)
- `src/app/admin/(dashboard)/intake/[id]/page.tsx` (replace scoring card with AI summary card)
- `src/app/api/admin/salon/summary/[id]/route.ts` (DELETE or replace with AI summary generation endpoint)
- `src/components/salon/salon-score-card.tsx` (DELETE -- replaced by AI summary card)
- `src/components/clients/client-detail-tabs.tsx` (remove AI Summary tab reference)
- `src/lib/chat-context.ts` (remove `formatSummaryForContext()`, replace with cached AI summary in context)
- `src/lib/schema.ts` (add AI summary cache table, remove color tables)
- `src/lib/queries/` (new AI summary cache queries)
- New API route for generating AI summary (or extend existing `/api/admin/chat`)
- Grep for any remaining `salon-summary` or `assessSalonIntake` imports and remove

---

## Out of Scope

- Service name changes (Spec C)
- Service description rewrites (Spec C)
- EXIF orientation fix (Spec B)
- AI chat enhancements (Spec B)
- Actual photo replacements (waiting on Karli)
- Direct send from website (future feature)
- Phone number on site (decided against)

---

## Success Criteria

1. Footer displays "All Beauty Hair Studio" as primary brand with "Located inside The Colour Parlor" secondary
2. Address links to Google Maps, schedule reads "By Appointment Only | Tuesday - Thursday"
3. FAQ has 11 questions including schedule, payment, Afterpay, and reworded cancellation
4. Mobile sticky "Book Now" visible on all public pages (except /book, /newclientform, /admin), works on iPhone Safari
5. Image constants in place for easy future photo swaps
6. Homepage and philosophy copy lead with cutting craft
7. Subtle "My Journey" link in "Person Behind the Chair" section
8. Color Lab completely removed -- no sidebar item, no pages, no API routes, no DB tables, no tests
9. Client detail page has 4 tabs (Overview, Intake Data, Bookings, Notes & History)
10. Overview tab shows hair profile, stylist notes, visit summary, and preferred contact at a glance
11. AI Summary tab, Color History tab, and Engagement tab removed
12. Intake detail page shows Claude-generated summary (badge + 2-3 sentences + 3-5 key points)
13. AI summary generated on-demand, cached in DB, no fallback to rule-based scoring
14. `salon-summary.ts`, its 73 tests, and scoring constants fully removed
15. 8 Pillars enforced in AI summary prompt (non-bias, inclusive, security, UX, AI ethics)
16. All remaining tests pass
17. Build succeeds
18. No accessibility regressions (contrast, touch targets, keyboard nav)
