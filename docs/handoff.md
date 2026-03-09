# All Beauty Hair Studio — Project Handoff Document

**Last Updated:** March 9, 2026
**Status:** Public site COMPLETE. Admin CRM COMPLETE (Phases A, B, F + Communication Hub + Legal + Visual Polish). Next: Phases C-E + VPS deployment.

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Founder Context](#founder-context)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Public Website](#public-website)
6. [Admin CRM](#admin-crm)
7. [Salon Intake System](#salon-intake-system)
8. [Square Bookings Integration](#square-bookings)
9. [Color Lab](#color-lab)
10. [Communication Hub + Legal](#communication-hub)
11. [Build History](#build-history)
12. [What Still Needs Work](#whats-next)
13. [For the Next Session](#next-session)

---

## 1. PROJECT OVERVIEW <a name="project-overview"></a>

**What:** Public-facing website for All Beauty Hair Studio + integrated admin CRM dashboard. One unified app: public site for clients + admin backend for managing them.

**Source:** `c:\kar\website\`
**GitHub:** https://github.com/allbeautyhairstudio/abhsweb
**Git identity:** "Bas & Kar" / kar.rosario@gmail.com (local config)
**SSH:** `github.com-allbeautyhairstudio` host alias

**History:** This project originally contained both the salon website and the AI Marketing Reset consulting business. The marketing reset has been fully separated into its own project. All reset-related code, docs, and the standalone `backendworkflow/` dashboard have been removed. This is now a salon-only codebase.

---

## 2. FOUNDER CONTEXT <a name="founder-context"></a>

**Who:** Karli Rosario — hairstylist, working out of a Sola salon suite
**Husband:** Bas — IT background, building his own IT business
**Location:** Wildomar, CA

**Key context:**
- Works 3 days/week maximum due to Ehlers-Danlos Syndrome (EDS) — chronic pain condition
- ADHD — affects executive function, task initiation
- All design decisions should be capacity-aware (3-day work week, not 5)
- Dashboard should be ADHD-friendly: clear status at a glance, not overwhelming

---

## 3. TECHNOLOGY STACK <a name="technology-stack"></a>

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js 16 (App Router) + TypeScript          |
| Database    | SQLite via better-sqlite3 (WAL mode)          |
| Styling     | Tailwind CSS 4 + shadcn/ui (Radix UI)        |
| Validation  | Zod                                           |
| Icons       | Lucide React                                  |
| Dates       | date-fns                                      |
| Testing     | Vitest (225 tests passing)                    |
| Bookings    | Square SDK v44                                |
| SMS         | nodemailer (email-to-SMS via carrier gateway) |

---

## 4. ARCHITECTURE <a name="architecture"></a>

```
c:\kar\website\
├── src/app/
│   ├── (public)/          ← Public salon website (route group)
│   │   ├── page.tsx       ← Homepage (hero + Meet Karli + CTA)
│   │   ├── about/         ← About Karli
│   │   ├── gallery/       ← Work gallery (live Instagram feed)
│   │   ├── blog/          ← Blog posts (hidden from nav)
│   │   ├── faq/           ← FAQ
│   │   ├── philosophy/    ← Hair philosophy
│   │   ├── newclientform/ ← Salon intake form (7-step wizard + photo uploads)
│   │   ├── book/          ← Square booking wizard (3-step)
│   │   └── layout.tsx     ← Public layout (header + footer + nav)
│   │
│   ├── admin/             ← CRM admin dashboard
│   │   ├── login/         ← Password-protected login
│   │   ├── layout.tsx     ← Admin layout (auth check)
│   │   └── (dashboard)/   ← Dashboard route group (sidebar nav)
│   │       ├── page.tsx           ← Dashboard home
│   │       ├── clients/           ← Client list + detail + new
│   │       ├── pipeline/          ← Kanban pipeline board (5 stages)
│   │       ├── intake/            ← Intake review queue + detail
│   │       ├── calendar/          ← Bookings calendar (4-view)
│   │       ├── color-lab/         ← Color formula tracking + inventory
│   │       ├── engagement/        ← Customer insights (placeholder)
│   │       ├── promotions/        ← Banner/popup management (placeholder)
│   │       ├── themes/            ← Seasonal theme picker (placeholder)
│   │       └── metrics/           ← Business analytics
│   │
│   └── api/               ← All API routes
│       ├── admin/         ← Admin-only endpoints (auth required)
│       ├── booking/       ← Public booking request + availability
│       ├── clients/       ← CRM CRUD
│       ├── color/         ← Color Lab (12 endpoints)
│       ├── contact/       ← Contact form
│       ├── intake/        ← Salon intake + photo upload
│       └── instagram/     ← Instagram feed proxy
│
├── src/components/        ← React components (layout, clients, pipeline, booking, color, salon, gallery, ui)
├── src/lib/               ← Core logic (db, auth, validation, queries, constants, Square client)
├── src/content/           ← Static content data (services, booking descriptions)
├── .env.local             ← DB path, admin password, Square tokens, SMS config
└── next.config.ts         ← Security headers, serverExternalPackages
```

### Database

SQLite with WAL mode. Tables:

| Table              | Purpose                                                     |
|--------------------|-------------------------------------------------------------|
| `clients`          | Wide table: 48 intake columns (q01-q48) + status/dates     |
| `client_notes`     | Per-client notes with type filter                           |
| `deliverables`     | Deliverable tracking per client                             |
| `generated_prompts`| Auto-populated prompt text per client                       |
| `revenue_entries`  | Payment tracking                                            |
| `color_lines`      | Color brand product lines                                   |
| `color_shades`     | Individual color shades per line                            |
| `color_formulas`   | Per-client color formulas with ingredients                  |
| `color_inventory`  | Stock levels with low-stock alerts                          |
| `booking_requests` | Local booking approval queue (before Square creation)       |

**Note:** The `clients` table still has a `business_type` column (default: 'salon'). All code now ignores this column — it exists only because removing it would require a DB migration. All clients are salon clients.

**DB path:** Configured in `.env.local` as `DATABASE_PATH`

### Auth

Cookie-based admin authentication (`src/lib/admin-auth.ts`):
- HMAC-SHA256 signed session tokens (timestamp.signature format)
- 7-day session expiration
- `ADMIN_SECRET` + `ADMIN_PASSWORD` env vars
- Middleware protects `/admin/*` routes
- `isAuthenticated()` helper for API routes that bypass middleware

---

## 5. PUBLIC WEBSITE <a name="public-website"></a>

| Page            | Route              | Description                                                         |
|-----------------|--------------------|---------------------------------------------------------------------|
| Homepage        | `/`                | Hero with salon background, "Meet Karli" section, dual CTA buttons  |
| About           | `/about`           | Karli's story, journey photos, philosophy                           |
| Gallery         | `/gallery`         | Live Instagram feed — mosaic layout, video autoplay, pagination     |
| FAQ             | `/faq`             | Common questions in Karli's voice                                   |
| Philosophy      | `/philosophy`      | Hair design philosophy                                              |
| New Client Form | `/newclientform`   | 7-step salon intake wizard with photo uploads                       |
| Book            | `/book`            | 3-step Square booking wizard                                        |
| Legal           | `/legal/*`         | Privacy, Terms, AI Disclosure, Data Retention                       |
| Blog            | `/blog`            | Blog posts (hidden from nav, placeholder content)                   |

**Design:**
- Warm copper/sage/cream brand palette
- Floral SVG accents (FloralBloom, FloralDivider, FloralCorner) in forest-500
- Botanical watercolor background on homepage
- All images are Karli's real photos or branded assets — no Unsplash stock
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
- Token expires every 60 days — needs refresh or auto-refresh setup

---

## 6. ADMIN CRM <a name="admin-crm"></a>

### Sidebar Navigation ("Command Center")

**Core:**
- Dashboard — metric cards, pipeline overview, intake alert, today's appointments, low stock alerts
- Intake Queue — pending intake review with badge count (60s polling)
- Clients — searchable list with bulk select + mass actions
- Pipeline — Kanban board (5 stages)
- Calendar — 4-view bookings calendar with direct booking

**Salon Tools:**
- Color Lab — formula tracking + inventory
- Customer Insights — placeholder (Phase C)
- Promotions — placeholder (Phase D)
- Site Themes — placeholder (Phase E)

**Marketing:**
- Metrics — summary cards, funnel, revenue

### Pipeline (5 Stages)

```
intake_submitted → ai_review → active_client → followup
                                    ↘ declined
```

| Stage              | Label          | Description                              |
|--------------------|----------------|------------------------------------------|
| `intake_submitted` | New Intake     | Intake form received, pending review     |
| `ai_review`        | Under Review   | AI Summary generated, awaiting review    |
| `active_client`    | Active Client  | Accepted, ongoing relationship           |
| `followup`         | Follow-Up      | Check-in or rebooking needed             |
| `declined`         | Declined       | Not a fit right now                      |

### Client Detail (7 Tabs)

1. **Overview** — status, dates, progress
2. **Intake Data** — contact info, full intake submission
3. **AI Summary** — salon scoring (readiness/complexity/engagement), flags, highlights
4. **Bookings** — Square booking history (matched by email)
5. **Color History** — formula timeline with duplicate/edit/delete
6. **Engagement** — placeholder (Phase C)
7. **Notes & History** — CRUD notes with type filter

---

## 7. SALON INTAKE SYSTEM <a name="salon-intake-system"></a>

### 7-Step Wizard (~25 fields + photo uploads)

1. **About You** — name, pronouns, email, phone, contact preference
2. **Your Hair** — love/hate, service interest, texture, length, density, condition
3. **Hair Personality & Routine** — styling self-description, daily routine, shampoo frequency
4. **Hair History** — treatments last 2 years, color reactions, current products
5. **Goals & Schedule** — what they want, maintenance frequency, availability (Tue-Thu)
6. **Show Me!** — selfie photos (front/side/back) + inspiration photos (max 6 total)
7. **Almost Done** — medical/allergy info, referral source, consent checkbox

**Photo uploads:** Two-phase submit (JSON then FormData), stored at `data/uploads/{clientId}/`, JPG/PNG/WebP/HEIC, 10MB max per file.

### AI Summary Engine

`src/lib/salon-summary.ts` — Pure function scoring:
- **3 axes:** Consultation Readiness (0-100), Complexity (0-100), Engagement (0-100)
- **Flags:** HEADS_UP (color correction, allergy, major change), GOOD_FIT (low-maintenance), NOTE (limited availability)
- **Highlights:** 4-6 decision bullets pulled from intake
- **Overall rating:** green / yellow / red
- Scoring rules in `src/lib/constants/salon-scoring-rules.ts`

### Intake Queue

- `/admin/intake` — list of pending intakes with unread indicators
- `/admin/intake/[id]` — detail page with AI scores, flags, full submission, accept/decline
- Accept → sets `active_client`, links booking requests by email
- Decline → sets `declined`, sends decline email
- Sidebar badge polls every 60 seconds

---

## 8. SQUARE BOOKINGS INTEGRATION <a name="square-bookings"></a>

Full Square Bookings API integration using `square` npm SDK v44.

### Public Booking (`/book`)

- 3-step wizard: service selection → date/time → customer info + confirmation
- Shopping cart with add/remove, sticky sidebar (desktop), bottom bar (mobile)
- Max 5 services per booking, consultation is standalone
- Custom service descriptions by Karli in `src/content/booking-services-data.ts`
- Availability: custom engine (NOT `searchAvailability` — it ghost-blocks cancelled bookings)
- No same-day public booking
- Submits to local approval queue, NOT directly to Square

### Admin Calendar (`/admin/calendar`)

- 4-view: Year (dot indicators), Month (compact cards), Week (day columns), Day (time grid)
- Direct booking from any view (bypasses approval queue for walk-ins)
- Approve/decline pending requests, cancel/reschedule accepted bookings
- Admin CAN book same-day
- PENDING bookings show amber, local requests show dashed amber border

### Booking Approval Queue

- Flow: Customer request → SQLite `booking_requests` → Karli approves → Square booking created
- Why local: Square tokens auto-accept bookings — local queue is the only way to gate them
- 3-layer conflict protection: on submit, on approve, 48h auto-expiration
- `client_id` links booking requests to intake clients by email

### Square Credentials

- Env vars: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT`
- Production token from "websiteconnector" app
- 9 bookable services, 1 team member (Karli)
- Location: "Doing business out of The Colour Parlor"

---

## 9. COLOR LAB <a name="color-lab"></a>

Full color formula tracking + inventory management.

**Database:** 4 tables — `color_lines`, `color_shades`, `color_formulas`, `color_inventory`

**Pre-populated:** 8 brands (~130 shades): Redken, Wella, Schwarzkopf, Joico, Kenra, Matrix, Pravana, Pulp Riot. "Create Your Own" for custom brands/lines/shades.

**Features:**
- Cascading shade picker: brand → line → shade
- Formula form: shade + developer volume + ratio + processing time + technique + placement + notes
- Formula timeline per client (newest first, duplicate/edit/delete)
- Inventory page with inline editing, low-stock alerts (amber)
- Dashboard card: Low Stock Alerts (top 5, links to Color Lab)
- Color History tab on client detail page

**12 API endpoints** under `/api/color/` — lines, shades, formulas CRUD + duplicate, inventory + alerts

---

## 10. COMMUNICATION HUB + LEGAL <a name="communication-hub"></a>

### Client Communication

- DB columns: `phone`, `birthdate`, `preferred_contact`, `services_received`, `consent_terms_accepted`, `consent_date`
- `ClientContactActions` component: `mailto:`, `tel:`, `sms:` links with preferred star indicator
- Integrated into: client detail, intake detail, intake queue, clients table, dashboard lists

### Legal Pages (`/legal/*`)

4 pages with shared layout: Privacy Policy, Terms of Use, Responsible AI Disclosure, Data Retention Policy. Written in Karli's voice, scannable format. Linked from footer + intake form consent + booking form.

### SMS Notification (Incomplete)

Wired but env vars need real credentials:

```env
NOTIFY_PHONE=9515551234          # Karli's phone number
SMS_GATEWAY=txt.att.net           # AT&T carrier gateway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password       # Gmail app password
```

---

## 11. BUILD HISTORY <a name="build-history"></a>

| Phase                              | Date       | Tests After |
|------------------------------------|------------|-------------|
| Website scaffold + public pages    | Feb 28     | —           |
| Admin CRM merge from backendworkflow| Mar 1     | —           |
| Two-business split                 | Mar 2      | 64          |
| Public site soul work + polish     | Mar 2      | 64          |
| Expanded intake form + photos      | Mar 2      | 64          |
| Instagram gallery                  | Mar 2      | 64          |
| Mini services menu                 | Mar 2      | 64          |
| Square Bookings integration        | Mar 3      | 95          |
| Booking approval queue             | Mar 3      | 95          |
| Admin bookable calendar            | Mar 3      | 95          |
| Phase A: Admin restructure         | Mar 4      | 95          |
| Phase B: Color Lab                 | Mar 5      | 143         |
| Phase F: Salon Pipeline Rethink    | Mar 5      | 225         |
| Communication Hub + Legal Pages    | Mar 5      | 225         |
| Launch Visual Polish               | Mar 8      | 225         |
| Marketing Reset removal            | Mar 9      | 225         |

---

## 12. WHAT STILL NEEDS WORK <a name="whats-next"></a>

### Next Phases

- **Phase C: Customer Insights** — Square API engagement data (visit history, spending, frequency)
- **Phase D: Promotions** — announcement bars + popup modals from admin
- **Phase E: Seasonal Themes** — CSS variable overrides, holiday presets

### Infrastructure

- [ ] VPS deployment — Nginx reverse proxy alongside OrcaChild
- [ ] Admin password change (currently `changeme` in `.env.local`)
- [ ] Instagram token auto-refresh (expires every 60 days)
- [ ] SMS env vars — configure with real credentials

### Content

- [ ] Real blog content (Karli needs to write/direct)
- [ ] New journey photos (IMG_3519, IMG_6365-67, IMG_0710, IMG_0715 — not yet converted/placed)

### Optional Cleanup

- [ ] Dead reset-era components still on disk (unused, not imported): `fit-assessment/`, `prompts/`, `deliverables/`, `scoring.ts`, `auto-populate.ts`
- [ ] Remove `business_type` column from DB schema (requires migration)
- [ ] Remove `businessType?` optional params from `queries/clients.ts` (harmless but dead code)

---

## 13. FOR THE NEXT SESSION <a name="next-session"></a>

1. Read this handoff for project context
2. Run `cd c:\kar\website && npx vitest run` to verify 225 tests pass
3. Run `npx next dev` for dev server
4. Continue from Phases C-E or infrastructure work

---

*This document is the master context for the All Beauty Hair Studio website + CRM project. The AI Marketing Reset consulting business has been separated into its own project and is no longer part of this codebase.*
