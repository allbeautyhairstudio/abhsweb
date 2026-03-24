# All Beauty Hair Studio -- Audit Log

**Last Updated:** March 23, 2026 (Session 7)

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
  Resolution: Updated intro, step copy, pre-booking notes,
  closing message, QR code.

- **R-002** -- Minor / Intake Form --
  QR code used raw `<img>` instead of Next.js `Image` component.
  Found: Mar 21. Resolved: Mar 21.
  Resolution: Swapped to `Image` for pattern consistency.

- **R-003** -- Important / Intake Form --
  Answer options didn't match Karli's Wix form.
  Found: Mar 21. Resolved: Mar 21 S2.
  Resolution: All 12 fields aligned, products to 6 inputs,
  color reaction to multi-select.

- **R-004** -- Minor / Intake Form --
  9 `&mdash;` HTML entities should be `--`.
  Found: Mar 21. Resolved: Mar 21 S2.
  Resolution: All 9 replaced.

- **R-005** -- Important / Admin --
  No photo gallery on intake detail page.
  Found: Mar 21 S2. Resolved: Mar 21 S2.
  Resolution: Photo gallery with pinch-to-zoom lightbox added.

- **R-006** -- Important / Admin --
  Mobile admin forced horizontal scrolling.
  Found: Mar 21 S2. Resolved: Mar 21 S2.
  Resolution: Intake queue cards, pipeline vertical stack,
  calendar responsive.

- **R-007** -- Important / Admin --
  Intake detail page too developer-facing.
  Found: Mar 21 S2. Resolved: Mar 21 S2.
  Resolution: Polished with warm styling, single status badge,
  sticky decision bar.

---

## Tech Debt

- **SMS** -- Medium --
  Twilio toll-free verification pending.
  Submitted March 21, check status next session.

- **Email** -- Medium --
  Email lifecycle system not yet built (5 timed emails).
  After AI chat integration.

- **AI** -- DONE --
  Claude API integration for intake review chat.
  Implemented Session 4. Streaming chat, draft mode, 292 tests.
  Needs deploy to VPS (add ANTHROPIC_API_KEY).

- **Photos** -- Low --
  Existing uploads not retroactively converted to WebP.
  Only new uploads get WebP treatment.

- **Deps** -- Low --
  3 deprecated subdependencies: node-domexception@1.0.0,
  prebuild-install@7.1.3, scmp@2.1.0.
  Upstream (Twilio, better-sqlite3). PostgreSQL migration removes
  prebuild-install. Twilio ones resolve with SDK update.

- **Security** -- DONE --
  Next.js 16.1.7 security patch.
  Patched 5 CVEs (CSRF, smuggling, DoS).
  Deployed to VPS Session 5.

- **Analytics** -- DONE --
  Umami tracking script.
  Wired into root layout, CSP updated.
  Deployed to VPS Session 5.

- **Animations** -- DONE --
  Framer Motion animation system. 6 motion components,
  animated vine divider, all 7 public pages animated,
  gallery lightbox, button micro-interactions.
  296 tests passing. Deployed to VPS Session 7.
  Mobile crash + alignment fixed Session 7.

- **VPS Security** -- DONE --
  Security headers on all 8 sites. SSH hardened.
  OS updates applied. Vite 6.4.1. Session 7.

- **DB Schema** -- Low --
  46 dead consulting columns in clients table.
  Clean up during PostgreSQL migration.
