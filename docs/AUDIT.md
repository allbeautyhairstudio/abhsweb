# All Beauty Hair Studio -- Audit Log

**Last Updated:** March 22, 2026 (Session 4)

---

## Open Issues

| ID | Severity | Area | Description | Found | Status |
|----|----------|------|-------------|-------|--------|
| A-002 | Info | Database | `business_type` column in `clients` table is unused (all salon). Removing requires SQLite migration -- harmless for now. | Mar 9 | Open |

---

## Resolved Issues

| ID | Severity | Area | Description | Found | Resolved | Resolution |
|----|----------|------|-------------|-------|----------|------------|
| R-001 | Important | Intake Form | Form copy didn't match Karli's original Wix form voice | Mar 21 | Mar 21 | Updated intro, step copy, pre-booking notes, closing message, QR code |
| R-002 | Minor | Intake Form | QR code used raw `<img>` instead of Next.js `Image` component | Mar 21 | Mar 21 | Swapped to `Image` for pattern consistency |
| R-003 | Important | Intake Form | Answer options didn't match Karli's Wix form | Mar 21 | Mar 21 S2 | All 12 fields aligned, products → 6 inputs, color reaction → multi-select |
| R-004 | Minor | Intake Form | 9 `&mdash;` HTML entities should be `--` | Mar 21 | Mar 21 S2 | All 9 replaced |
| R-005 | Important | Admin | No photo gallery on intake detail page | Mar 21 S2 | Mar 21 S2 | Photo gallery with pinch-to-zoom lightbox added |
| R-006 | Important | Admin | Mobile admin forced horizontal scrolling | Mar 21 S2 | Mar 21 S2 | Intake queue cards, pipeline vertical stack, calendar responsive |
| R-007 | Important | Admin | Intake detail page too developer-facing | Mar 21 S2 | Mar 21 S2 | Polished with warm styling, single status badge, sticky decision bar |

---

## Tech Debt

| Area | Description | Priority | Notes |
|------|-------------|----------|-------|
| SMS | Twilio toll-free verification pending | Medium | Submitted March 21, check status next session |
| Email | Email lifecycle system not yet built (5 timed emails) | Medium | After AI chat integration |
| AI | Claude API integration for intake review chat | DONE | Implemented Session 4. Streaming chat, draft mode, 292 tests. Needs deploy. |
| Photos | Existing uploads not retroactively converted to WebP | Low | Only new uploads get WebP treatment |
| Deps | 3 deprecated subdependencies: node-domexception@1.0.0, prebuild-install@7.1.3, scmp@2.1.0 | Low | Upstream (Twilio, better-sqlite3). PostgreSQL migration removes prebuild-install. Twilio ones resolve with SDK update. |
