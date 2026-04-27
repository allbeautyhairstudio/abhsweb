# All Beauty Hair Studio -- Audit Log

**Last Updated:** April 11, 2026 (Governance Audit)

---

## Open Issues

- **A-002** -- Info / Database --
  `business_type` column in `clients` table is unused (all salon).
  Removing requires SQLite migration -- harmless for now.
  Found: Mar 9. Status: Open.

---

- **A-003** -- Info / Database --
  46 dead consulting columns (q01-q48) in `clients` table from Marketing Reset era.
  Not exposed to users. Clean up during PostgreSQL migration.
  Found: Mar 23. Status: Open.

---

## Resolved Issues

- **R-012** -- Moderate / Admin --
  AI Summary tab showed 3-axis scoring cards (Readiness/Complexity/Engagement) that
  weren't useful for Karli's decision-making. Replaced with badge + flags + highlights view.
  Found: Mar 23. Resolved: Mar 23 S8.

- **R-013** -- Moderate / Public Site --
  52 em dashes across all public pages (homepage, FAQ, philosophy, about, blog, legal).
  Found: Mar 23. Resolved: Mar 23 S8. All replaced with double dashes.

- **R-014** -- Minor / Admin --
  Nested `<a>` tags in mobile client list (ClientContactActions inside Link).
  Caused hydration mismatch error. Found: Mar 23. Resolved: Mar 23 S8.

- **R-015** -- Minor / Gallery --
  Mobile gallery lightbox not centering videos at certain scroll positions.
  Fixed with 100dvh + touch-none. Found: Mar 23. Resolved: Mar 23 S8.

- **R-008** -- Critical / Public Site --
  Mobile crash on all pages. `useTransform` hook called conditionally inside JSX
  in `floral-divider-animated.tsx` (Rules of Hooks violation). Desktop worked fine.
  Found: Mar 23. Resolved: Mar 23 S7.

- **R-009** -- Important / Public Site --
  Mobile layout misaligned (text shifted -40px left). MotionReveal not resetting
  `x: 0, y: 0` when animation tier changed from 'full' to 'reduced'.
  Found: Mar 23. Resolved: Mar 23 S7.

- **R-010** -- Important / VPS Security --
  SSH `PasswordAuthentication yes` in `50-cloud-init.conf` overriding secure config.
  7 of 8 Nginx sites missing security headers (only OrcaChild had them).
  6 pending OS security updates not applied.
  Found: Mar 23. Resolved: Mar 23 S7.

- **R-011** -- Moderate / Dev Dependencies --
  Vite 6.3.5 had 3 known vulnerabilities (1 moderate, 2 low).
  Found: Mar 23. Resolved: Mar 23 S7. Bumped to 6.4.1.

- **R-001** -- Important / Intake Form --
  Form copy didn't match Karli's original Wix form voice.
  Found: Mar 21. Resolved: Mar 21.

- **R-002** -- Minor / Intake Form --
  QR code used raw `<img>` instead of Next.js `Image` component.
  Found: Mar 21. Resolved: Mar 21.

- **R-003** -- Important / Intake Form --
  Answer options didn't match Karli's Wix form.
  Found: Mar 21. Resolved: Mar 21 S2.

- **R-004** -- Minor / Intake Form --
  9 `&mdash;` HTML entities should be `--`.
  Found: Mar 21. Resolved: Mar 21 S2.

- **R-005** -- Important / Admin --
  No photo gallery on intake detail page.
  Found: Mar 21 S2. Resolved: Mar 21 S2.

- **R-006** -- Important / Admin --
  Mobile admin forced horizontal scrolling.
  Found: Mar 21 S2. Resolved: Mar 21 S2.

- **R-007** -- Important / Admin --
  Intake detail page too developer-facing.
  Found: Mar 21 S2. Resolved: Mar 21 S2.

---

## Tech Debt

- **SMS** -- Medium --
  Twilio toll-free verification pending.
  Submitted March 21, check status next session.

- **Email** -- Medium --
  Email lifecycle system not yet built (5 timed emails).

- **Photos** -- Low --
  Existing uploads not retroactively converted to WebP.
  Only new uploads get WebP treatment. New uploads now auto-orient via EXIF.

- **Deps** -- Low --
  Deprecated subdependencies upstream (Twilio, better-sqlite3).
  Dependabot now monitors. 12 vulnerabilities patched post-S8.

- **DB Schema** -- Low --
  46 dead consulting columns in clients table.
  Clean up during PostgreSQL migration.

- **Consultation UX** -- In Progress --
  Consultation detail page redesign spec written (ADHD-friendly, tab-based).
  Implementation plan needed. "Intake" renamed to "consultation" across display text.

- **Input Guardrails** -- Resolved --
  Spam/injection/prompt-injection checks added to all form fields.
  23 new sanitize tests. Selfie now required. Referral source required.
