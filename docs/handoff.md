# All Beauty Hair Studio -- Project Handoff Document

**Last Updated:** April 11, 2026 (Governance Audit)
**Status:** **LIVE at allbeautyhairstudio.com** -- Public site + Admin CRM + Square booking widget +
email notifications + AI chat assistant with Stylist Notes + Draft Response. Umami analytics wired.
Next.js 16.1.7 + Vite 6.4.2 security patches deployed. Framer Motion animations deployed.
VPS fully hardened. Color Lab removed. Dark forest green admin sidebar.
Premium SEO + OG images. Consultation form (renamed from intake). "Referral" replaces "Declined."
Input guardrails (spam/injection/prompt-injection). Dependabot enabled. 12 security vulns patched.
280 tests passing across 12 files.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Founder Context](#2-founder-context)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Public Website](#5-public-website)
6. [Admin CRM](#6-admin-crm)
7. [Salon Intake System](#7-salon-intake-system)
8. [Square Bookings Integration](#8-square-bookings-integration)
9. [Color Lab](#9-color-lab)
10. [Communication Hub + Legal](#10-communication-hub--legal)
11. [Build History](#11-build-history)
12. [What Still Needs Work](#12-what-still-needs-work)
13. [For the Next Session](#13-for-the-next-session)

---

## 1. PROJECT OVERVIEW

**What:** Public-facing website for All Beauty Hair Studio + integrated admin CRM dashboard.
One unified app: public site for clients + admin backend for managing them.

**Source:** `c:\kar\abhs\`
**GitHub:** <https://github.com/allbeautyhairstudio/abhsweb>
**Git identity:** "Bas & Kar" / `kar.rosario@gmail.com` (local config)
**SSH:** `github.com-allbeautyhairstudio` host alias

**History:** This project originally contained both the salon website and the AI Marketing Reset
consulting business. The marketing reset has been fully separated into its own project. All
reset-related code, docs, and the standalone `backendworkflow/` dashboard have been removed.
This is now a salon-only codebase.

---

## 2. FOUNDER CONTEXT

**Who:** Karli Rosario -- hairstylist, working out of a Sola salon suite
**Husband:** Bas -- IT background, building his own IT business
**Location:** Wildomar, CA

**Key context:**

- Works 3 days/week maximum due to Ehlers-Danlos Syndrome (EDS) -- chronic pain condition
- ADHD -- affects executive function, task initiation
- All design decisions should be capacity-aware (3-day work week, not 5)
- Dashboard should be ADHD-friendly: clear status at a glance, not overwhelming

---

## 3. TECHNOLOGY STACK

- **Framework** -- Next.js 16 (App Router) + TypeScript
- **Database** -- SQLite via better-sqlite3 (WAL mode)
- **Styling** -- Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Validation** -- Zod
- **Icons** -- Lucide React
- **Dates** -- date-fns
- **Testing** -- Vitest (280 tests passing)
- **AI Chat** -- Anthropic SDK (@anthropic-ai/sdk v0.80.0)
- **Bookings** -- Square SDK v44
- **Images** -- sharp (WebP conversion on upload)
- **SMS** -- Twilio SDK (pending toll-free verification)

---

## 4. ARCHITECTURE

```text
c:\kar\abhs\
├── src/app/
│   ├── (public)/          <- Public salon website (route group)
│   │   ├── page.tsx       <- Homepage (hero + Meet Karli + CTA)
│   │   ├── about/         <- About Karli
│   │   ├── gallery/       <- Work gallery (live Instagram feed)
│   │   ├── blog/          <- Blog posts (hidden from nav)
│   │   ├── faq/           <- FAQ
│   │   ├── philosophy/    <- Hair philosophy
│   │   ├── newclientform/ <- Salon intake form (7-step wizard + photo uploads)
│   │   ├── book/          <- Square booking wizard (3-step)
│   │   └── layout.tsx     <- Public layout (header + footer + nav)
│   │
│   ├── admin/             <- CRM admin dashboard
│   │   ├── login/         <- Password-protected login
│   │   ├── layout.tsx     <- Admin layout (auth check)
│   │   └── (dashboard)/   <- Dashboard route group (sidebar nav)
│   │       ├── page.tsx           <- Dashboard home
│   │       ├── clients/           <- Client list + detail + new
│   │       ├── pipeline/          <- Kanban pipeline board (5 stages)
│   │       ├── intake/            <- Consultation review queue + detail
│   │       ├── calendar/          <- Bookings calendar (4-view)
│   │       ├── engagement/        <- Customer insights (placeholder)
│   │       ├── promotions/        <- Banner/popup management (placeholder)
│   │       ├── themes/            <- Seasonal theme picker (placeholder)
│   │       └── metrics/           <- Business analytics
│   │
│   └── api/               <- All API routes
│       ├── admin/         <- Admin-only endpoints (auth required)
│       ├── booking/       <- Public booking request + availability
│       ├── clients/       <- CRM CRUD
│       ├── intake/        <- Consultation form + photo upload
│       └── instagram/     <- Instagram feed proxy
│
├── src/components/        <- React components (layout, clients, pipeline, booking, color, salon, gallery, ui)
├── src/lib/               <- Core logic (db, auth, validation, queries, constants, Square client)
├── src/content/           <- Static content data (services, booking descriptions)
├── .env.local             <- DB path, admin password, Square tokens, SMS config
└── next.config.ts         <- Security headers, serverExternalPackages
```

### Database

SQLite with WAL mode. Tables:

- **`clients`** -- Wide table: 48 intake columns (q01-q48) + status/dates
- **`client_notes`** -- Per-client notes with type filter
- **`revenue_entries`** -- Payment tracking
- **`booking_requests`** -- Local booking approval queue (before Square creation)
- **`chat_messages`** -- AI chat history per client (cascade-deleted with client)

**Note:** The `clients` table still has a `business_type` column (default: 'salon').
All code now ignores this column -- it exists only because removing it would require a DB migration.
All clients are salon clients.

**DB path:** Configured in `.env.local` as `DATABASE_PATH`

### Auth

Cookie-based admin authentication (`src/lib/admin-auth.ts`):

- HMAC-SHA256 signed session tokens (timestamp.signature format)
- 7-day session expiration
- `ADMIN_SECRET` + `ADMIN_PASSWORD` env vars
- Middleware protects `/admin/*` routes
- `isAuthenticated()` helper for API routes that bypass middleware

---

## 5. PUBLIC WEBSITE

- **Homepage** (`/`) -- Hero with salon background, "Meet Karli" section, dual CTA buttons
- **About** (`/about`) -- Karli's story, journey photos, philosophy
- **Gallery** (`/gallery`) -- Live Instagram feed -- mosaic layout, video autoplay, pagination
- **FAQ** (`/faq`) -- Common questions in Karli's voice
- **Philosophy** (`/philosophy`) -- Hair design philosophy
- **New Client Form** (`/newclientform`) -- 7-step salon intake wizard with photo uploads
- **Book** (`/book`) -- 3-step Square booking wizard
- **Legal** (`/legal/*`) -- Privacy, Terms, AI Disclosure, Data Retention
- **Blog** (`/blog`) -- Blog posts (hidden from nav, placeholder content)

**Design:**

- Warm copper/sage/cream brand palette
- Floral SVG accents (FloralBloom, FloralDivider, FloralCorner) in forest-500
- Botanical watercolor background on homepage
- All images are Karli's real photos or branded assets -- no Unsplash stock
- Mobile-responsive with hamburger nav
- Security headers: CSP, X-Frame-Options DENY, HSTS, X-Content-Type-Options
- Homepage hero: "New Here? Let's Talk" + "Already a Client? Book Here"
- LGBTQIA+ badge in footer

### Instagram Gallery

Live feed from `@allbeautyhairstudio` via Instagram Graph API v21.0:

- Mosaic CSS columns, video autoplay (IntersectionObserver, respects `prefers-reduced-motion`)
- Server-side proxy with rate limiting (20 req/IP/hour)
- Token in `.env.local`, refreshable via Meta Developer Dashboard
- Meta app: "abhswebsiteconnector" (App ID: 941675704986819)
- Token expires every 60 days -- needs refresh or auto-refresh setup

---

## 6. ADMIN CRM

### Sidebar Navigation ("Command Center")

**Core:**

- Dashboard -- metric cards, pipeline overview, intake alert, today's appointments, low stock alerts
- Intake Queue -- pending intake review with badge count (60s polling)
- Clients -- searchable list with bulk select + mass actions
- Pipeline -- Kanban board (5 stages)
- Calendar -- 4-view bookings calendar with direct booking

**Salon Tools:**

- Color Lab -- formula tracking + inventory
- Customer Insights -- placeholder (Phase C)
- Promotions -- placeholder (Phase D)
- Site Themes -- placeholder (Phase E)

**Marketing:**

- Metrics -- summary cards, funnel, revenue

### Pipeline (5 Stages)

```text
intake_submitted -> ai_review -> active_client -> followup
                                    \-> referral
```

- **`intake_submitted`** (New Consultation) -- Consultation form received, pending review
- **`ai_review`** (Under Review) -- AI Summary generated, awaiting review
- **`active_client`** (Active Client) -- Accepted, ongoing relationship
- **`followup`** (Follow-Up) -- Check-in or rebooking needed
- **`referral`** (Referral) -- Referred out (separate from Decline)

### Client Detail (7 Tabs)

1. **Overview** -- status, dates, progress
2. **Intake Data** -- contact info, full intake submission
3. **AI Summary** -- salon scoring (readiness/complexity/engagement), flags, highlights
4. **Bookings** -- Square booking history (matched by email)
5. **Color History** -- formula timeline with duplicate/edit/delete
6. **Engagement** -- placeholder (Phase C)
7. **Notes & History** -- CRUD notes with type filter

---

## 7. SALON INTAKE SYSTEM

### 7-Step Wizard (~25 fields + photo uploads)

1. **About You** -- name, pronouns, email, phone, contact preference
2. **Your Hair** -- love/hate, service interest, texture, length, density, condition
3. **Hair Personality & Routine** -- styling self-description, daily routine, shampoo frequency
4. **Hair History** -- treatments last 2 years, color reactions, current products
5. **Goals & Schedule** -- what they want, maintenance frequency, availability (Tue-Thu)
6. **Show Me!** -- selfie photos (front/side/back) + inspiration photos (max 6 total)
7. **Almost Done** -- medical/allergy info, referral source, consent checkbox

**Photo uploads:** Two-phase submit (JSON then FormData), stored at `data/uploads/{clientId}/`,
JPG/PNG/WebP/HEIC, 10MB max per file.

### AI Summary Engine

`src/lib/salon-summary.ts` -- Pure function scoring:

- **3 axes:** Consultation Readiness (0-100), Complexity (0-100), Engagement (0-100)
- **Flags:** HEADS_UP (color correction, allergy, major change), GOOD_FIT (low-maintenance),
  NOTE (limited availability)
- **Highlights:** 4-6 decision bullets pulled from intake
- **Overall rating:** green / yellow / red
- Scoring rules in `src/lib/constants/salon-scoring-rules.ts`

### Intake Queue

- `/admin/intake` -- list of pending intakes with unread indicators
- `/admin/intake/[id]` -- detail page with AI scores, flags, full submission, accept/decline
- Accept -> sets `active_client`, links booking requests by email
- Decline -> sets `declined`, sends decline email
- Sidebar badge polls every 60 seconds

---

## 8. SQUARE BOOKINGS INTEGRATION

Full Square Bookings API integration using `square` npm SDK v44.

### Public Booking (`/book`)

- 3-step wizard: service selection -> date/time -> customer info + confirmation
- Shopping cart with add/remove, sticky sidebar (desktop), bottom bar (mobile)
- Max 5 services per booking, consultation is standalone
- Custom service descriptions by Karli in `src/content/booking-services-data.ts`
- Availability: custom engine (NOT `searchAvailability` -- it ghost-blocks cancelled bookings)
- No same-day public booking
- Submits to local approval queue, NOT directly to Square

### Admin Calendar (`/admin/calendar`)

- 4-view: Year (dot indicators), Month (compact cards), Week (day columns), Day (time grid)
- Direct booking from any view (bypasses approval queue for walk-ins)
- Approve/decline pending requests, cancel/reschedule accepted bookings
- Admin CAN book same-day
- PENDING bookings show amber, local requests show dashed amber border

### Booking Approval Queue

- Flow: Customer request -> SQLite `booking_requests` -> Karli approves -> Square booking created
- Why local: Square tokens auto-accept bookings -- local queue is the only way to gate them
- 3-layer conflict protection: on submit, on approve, 48h auto-expiration
- `client_id` links booking requests to intake clients by email

### Square Credentials

- Env vars: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`
- Production token from "websiteconnector" app
- 9 bookable services, 1 team member (Karli)
- Location: "Doing business out of The Colour Parlor"

---

## 9. COLOR LAB

Full color formula tracking + inventory management.

**Database:** 4 tables -- `color_lines`, `color_shades`, `color_formulas`, `color_inventory`

**Pre-populated:** 8 brands (~130 shades): Redken, Wella, Schwarzkopf, Joico, Kenra, Matrix,
Pravana, Pulp Riot. "Create Your Own" for custom brands/lines/shades.

**Features:**

- Cascading shade picker: brand -> line -> shade
- Formula form: shade + developer volume + ratio + processing time + technique + placement + notes
- Formula timeline per client (newest first, duplicate/edit/delete)
- Inventory page with inline editing, low-stock alerts (amber)
- Dashboard card: Low Stock Alerts (top 5, links to Color Lab)
- Color History tab on client detail page

**12 API endpoints** under `/api/color/` -- lines, shades, formulas CRUD + duplicate, inventory + alerts

---

## 10. COMMUNICATION HUB + LEGAL

### Client Communication

- DB columns: `phone`, `birthdate`, `preferred_contact`, `services_received`,
  `consent_terms_accepted`, `consent_date`
- `ClientContactActions` component: `mailto:`, `tel:`, `sms:` links with preferred star indicator
- Integrated into: client detail, intake detail, intake queue, clients table, dashboard lists

### Legal Pages (`/legal/*`)

4 pages with shared layout: Privacy Policy, Terms of Use, Responsible AI Disclosure,
Data Retention Policy. Written in Karli's voice, scannable format. Linked from footer +
intake form consent + booking form.

### SMS Notification (Incomplete)

Wired but env vars need real credentials:

```text
NOTIFY_PHONE=9515551234          # Karli's phone number
SMS_GATEWAY=txt.att.net           # AT&T carrier gateway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password       # Gmail app password
```

---

## 11. BUILD HISTORY

- **Website scaffold + public pages** -- Feb 28
- **Admin CRM merge from backendworkflow** -- Mar 1
- **Two-business split** -- Mar 2 (64 tests)
- **Public site soul work + polish** -- Mar 2 (64 tests)
- **Expanded intake form + photos** -- Mar 2 (64 tests)
- **Instagram gallery** -- Mar 2 (64 tests)
- **Mini services menu** -- Mar 2 (64 tests)
- **Square Bookings integration** -- Mar 3 (95 tests)
- **Booking approval queue** -- Mar 3 (95 tests)
- **Admin bookable calendar** -- Mar 3 (95 tests)
- **Phase A: Admin restructure** -- Mar 4 (95 tests)
- **Phase B: Color Lab** -- Mar 5 (143 tests)
- **Phase F: Salon Pipeline Rethink** -- Mar 5 (225 tests)
- **Communication Hub + Legal Pages** -- Mar 5 (225 tests)
- **Launch Visual Polish** -- Mar 8 (225 tests)
- **Marketing Reset removal** -- Mar 9 (225 tests)
- **Cleanup, audit, API auth, SEO** -- Mar 11 (225 tests)
- **VPS deploy (PM2 + Nginx, port 3005)** -- Mar 12 (225 tests)
- **Square widget swap + Twilio + email** -- Mar 21 (225 tests)
- **DNS + SSL + production launch** -- Mar 21 (225 tests)
- **Intake form voice + QR code** -- Mar 21 (225 tests)
- **Intake options alignment (Wix)** -- Mar 21 (268 tests)
- **WebP photo conversion (sharp)** -- Mar 21 (268 tests)
- **Photo gallery + zoom on intake** -- Mar 21 (268 tests)
- **Mobile-responsive admin panel** -- Mar 21 (268 tests)
- **Admin intake polish + sticky bar** -- Mar 21 (268 tests)
- **AI chat design spec + plan written** -- Mar 21 (268 tests)
- **Global projectmap directory** -- Mar 21 (268 tests)
- **Intake detail Q&A format rework** -- Mar 22 (268 tests)
- **AI chat implementation (8 tasks)** -- Mar 22 (292 tests)
- **Clickable intake queue rows** -- Mar 22 (292 tests)
- **Umami analytics tracking wired** -- Mar 22 (292 tests)
- **Next.js 16.1.6 -> 16.1.7 security** -- Mar 22 (292 tests)
- **Framer Motion animation system** -- Mar 22 S6 (296 tests)
  - 6 motion components: MotionReveal, MotionParallax, MotionPage, MotionFloral, MotionButton, MotionGalleryLightbox
  - Animated floral divider with scroll-linked vine draw-in
  - All 7 public pages animated (hero cascade, scroll reveals, card stagger, parallax, FAQ accordion, form step transitions, gallery lightbox)
  - Header nav underline, mobile nav slide + stagger
  - Spring micro-interactions on CTA buttons
  - Three-tier system: full (desktop), reduced (mobile), none (prefers-reduced-motion)
  - Studio-quality FloralBloom (cabbage rose) + FloralCorner (lush cascade) SVG redesign
  - FloralCorner withVines prop for trailing botanical extensions
  - FloralBloom removed from heading accents (too cluttered at larger sizes)
- **My Journey page gradient overlay** -- Mar 22 S6 (296 tests)
  - White gradient overlay (15% left, 65% right) -- Karli shows through on left
  - "My Journey -- Read More" link added to homepage Person Behind the Chair section
- **framer-motion + happy-dom added** to dependencies (296 tests, 4 new for useAnimationTier hook)
- **Plan B: Backend AI Enhancements** -- Mar 23 S8 (257 tests)
  - EXIF auto-orientation on photo uploads (sharp .rotate())
  - Stylist Notes: DB queries, chat context, API (GET/PUT), collapsible UI in chat panel
  - Draft Response button + Karli voice profile guardrails in system prompt
  - Draft Preview Cards (sage styling, channel badge, copy-to-clipboard)
  - Color Lab fully removed (7 API routes, 4 components, 4 DB tables, 48 tests, 2889 lines)
  - AI Summary tab reworked (badge + flags + highlights, no scoring cards)
  - Nested anchor hydration fix on clients page
  - 9 new tests (5 stylist notes + 4 chat context)
- **Admin sidebar** -- dark forest green with white text (Mar 23 S8)
- **Em dash sweep** -- 52 em dashes replaced across all public pages (Mar 23 S8)
- **Gallery lightbox mobile fix** -- 100dvh + touch-none for proper centering (Mar 23 S8)
- **Ask AI button** -- text always visible on mobile (Mar 23 S8)
- **Intake detail redesign spec written** -- ADHD-friendly tab-based layout, gap detection (Mar 23 S8)
- **Gallery static divider** -- Replaced animated divider with static on gallery page
- **Footer location clickable** -- Google Maps link, removed "3 days per week"
- **FAQ updates** -- Removed pricing and unsure FAQs per Karli, corrected salon address
- **Consultation form rename** -- "Intake form" renamed to "consultation form" across all display text
- **Form validation** -- Selfie required, referral source required, back-button resubmit prevention, side scroll fix
- **Decline email rewrite** -- Warmer tone for consultation decline emails
- **"Declined" renamed to "Referral"** -- Across admin UI with separate Refer Out and Decline buttons with distinct emails
- **Security patch** -- 12 vulnerabilities patched (nodemailer, @anthropic-ai/sdk, happy-dom, picomatch, path-to-regexp, shadcn transitive deps)
- **Dependabot enabled** -- Automated dependency security monitoring
- **Input guardrails** -- Spam/injection/prompt-injection checks, photo upload perf, consultation UX improvements. 23 new sanitize tests.
- **OG images** -- Branded social cards for all public pages (homepage, gallery, FAQ, philosophy, consultation form, book, about, legal). Shared OG image helper.
- **Premium SEO + AIO overhaul** -- Local search dominance, Karli treats FAQ section, single static OG image
- **Double dashes to commas** -- Replaced double dashes with commas in client-facing copy
- **Mobile crash fix** -- Mar 23 S7 (296 tests)
  - `useTransform` hook called conditionally inside JSX in `floral-divider-animated.tsx` -- Rules of Hooks violation
  - Motion transforms not resetting `x: 0, y: 0` when tier changed to 'reduced' on mobile
  - Philosophy page CTA-to-footer spacing, scissors overlay tuned to 75%
- **Vite security patch** -- Mar 23 S7 (296 tests)
  - Vite 6.3.5 -> 6.4.1 (3 vulnerabilities patched, 0 remaining)
- **VPS security hardening** -- Mar 23 S7
  - Added security headers to all 8 Nginx sites (shared snippet at `/etc/nginx/snippets/security-headers.conf`)
  - X-Frame-Options DENY, HSTS, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, server_tokens off
  - Fixed SSH `PasswordAuthentication yes` in `50-cloud-init.conf` -> `no`
  - Applied 6 OS security updates (libtiff6, python3-openssl, coreutils, docker-compose, monarx)
- **BuiltByBas LLC filed in California** -- Mar 23 S7

---

## 12. WHAT STILL NEEDS WORK

### Next Phases

- **Phase C: Customer Insights** -- Square API engagement data (visit history, spending, frequency)
- **Phase D: Promotions** -- announcement bars + popup modals from admin
- **Phase E: Seasonal Themes** -- CSS variable overrides, holiday presets

### Infrastructure

- [x] VPS deployment -- PM2 + Nginx on port 3005 (deployed March 12, 2026)
- [x] Admin password changed for production
- [x] DNS -- GoDaddy A records for `@` + `www` -> 72.62.200.30 (March 21, 2026)
- [x] SSL -- Let's Encrypt via certbot, auto-renews, expires 2026-06-19 (March 21, 2026)
- [x] Instagram token auto-refresh built into `instagram.ts` (50-day cycle, self-healing on 400)
- [x] Email notifications -- Gmail SMTP with app password, detailed intake emails with admin links
- [x] Square booking widget -- iframe embed on `/book`
  (temporary, custom wizard preserved for swap-back)
- [x] Intake form voice update -- Karli's Wix form intro, neurodivergent disclosure, QR code,
  copy updates, photo/SMS consent, closing message (March 21, 2026)
- [x] Intake form options alignment -- all 12 fields matched to Karli's Wix form,
  products -> 6 inputs, color reaction -> multi-select checkboxes (March 21, 2026 Session 2)
- [x] Photo uploads auto-convert to WebP via sharp (quality 80)
  -- saves server space (March 21, 2026 Session 2)
- [x] Photo gallery on intake detail page with pinch-to-zoom lightbox
  (March 21, 2026 Session 2)
- [x] Mobile-responsive admin -- intake queue cards, pipeline vertical stack,
  calendar day-view default (March 21, 2026 Session 2)
- [x] Admin intake polish -- warm ABHS styling, single status badge,
  sticky accept/decline bar with iPhone safe area (March 21, 2026 Session 2)
- [x] `&mdash;` cleanup -- all 9 instances fixed (A-001 resolved)
  (March 21, 2026 Session 2)
- [x] **AI chat for intake review** -- IMPLEMENTED (Session 4). Streaming Claude Sonnet chat on
  intake detail page. Draft mode for SMS/email/both. Persistent chat history in SQLite.
  292 tests passing. `ANTHROPIC_API_KEY` in `.env.local`. Needs deploy to VPS with API key added.
- [x] **Umami analytics** -- Tracking script wired into root layout,
  CSP updated for analytics.builtbybas.com. Deployed to VPS. (Session 5, March 22, 2026)
- [x] **Next.js security patch** -- 16.1.6 -> 16.1.7 across all projects.
  Patches CSRF bypass, HTTP smuggling, image cache DoS, resume buffering DoS.
  Deployed to VPS. (Session 5, March 22, 2026)
- [ ] **Email lifecycle system** -- 5 timed emails
  (booking confirm, 7-day, 48h, 24h, post-visit thank you)
- [ ] Twilio SMS -- toll-free verification submitted March 21, check status next session
- [x] My Journey page -- gradient overlay + homepage link added (Session 6).
  Still hidden from nav, discoverable via "My Journey -- Read More" link.
- [x] **Framer Motion animations** -- deployed to VPS (Session 7, March 23, 2026).
  Fixed mobile crash (conditional hook call) and transform reset. 296 tests.
- [x] **VPS security hardening** -- security headers on all 8 sites, SSH password auth disabled,
  OS updates applied, server version hidden. (Session 7, March 23, 2026)
- [x] **Vite security patch** -- 6.3.5 -> 6.4.1 -> 6.4.2, vulnerabilities patched. (Session 7+)
- [x] **Consultation form rename** -- "Intake form" renamed to "consultation form" in all display text
- [x] **Referral rename** -- "Declined" renamed to "Referral" with separate Refer Out and Decline buttons
- [x] **Input guardrails** -- Spam/injection/prompt-injection checks on all form fields (sanitize.ts + 23 tests)
- [x] **Dependabot** -- Automated dependency security monitoring enabled
- [x] **12 security vulns patched** -- nodemailer, @anthropic-ai/sdk, happy-dom, picomatch, path-to-regexp, shadcn transitive deps
- [x] **OG images** -- Branded social cards for all public pages, shared helper, single static OG image
- [x] **Premium SEO + AIO** -- Local search dominance overhaul, structured data, Karli treats FAQ

### Content

- [ ] Real blog content (Karli needs to write/direct)
- [ ] New journey photos (IMG_3519, IMG_6365-67, IMG_0710, IMG_0715 -- not yet converted/placed)

### Optional Cleanup

- [ ] Remove `business_type` column from DB schema
  (requires SQLite migration -- harmless for now, all code ignores it)

---

## 13. FOR THE NEXT SESSION

### Consultation Detail Redesign

**Status:** Spec approved and committed. Needs implementation plan written, then executed.
**Spec:** `docs/superpowers/specs/2026-03-23-intake-detail-redesign-design.md`
**Mockup:** `public/mockup.html` (viewable at `/mockup.html` on dev server)

**What the redesign does:**

- 3-tab layout: At a Glance, Full Consultation, Photos
- Gap detection (missing/sparse fields flagged amber, health flags red)
- "Draft Email Follow-Up" and "Draft SMS Follow-Up" buttons integrated with AI chat
- ADHD-friendly design: visual hierarchy, chunking, progressive disclosure
- IntakeChatPanel needs `forwardRef` + `useImperativeHandle` for programmatic open

### Plan C: Service Menu Restructure

- Plan file: `docs/superpowers/plans/2026-03-22-service-menu-restructure-plan.md`
- Cut-forward descriptions, color as lived-in enhancements

### Other Priorities

- Printable/PDF version of consultation Q&A output
- PostgreSQL migration (cleans up 46 dead consulting columns + `business_type`)
- Email lifecycle system (5 timed emails)
- Twilio SMS verification check (submitted March 21)
- **Plan A: Public Site Refresh** -- deferred
  (Plan file: `docs/superpowers/plans/2026-03-22-public-site-refresh-plan.md`)

### Session Start

1. Read this handoff for project context
2. Run `cd c:\kar\abhs && npx vitest run` to verify 280 tests pass
3. Check for unpushed commits

---

*This document is the master context for the All Beauty Hair Studio website + CRM project.
The AI Marketing Reset consulting business has been separated into its own project and is no
longer part of this codebase.*
