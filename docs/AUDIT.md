# All Beauty Hair Studio -- Audit Log

**Last Updated:** March 21, 2026

---

## Open Issues

| ID | Severity | Area | Description | Found | Status |
|----|----------|------|-------------|-------|--------|
| A-001 | Minor | Intake Form | 9 remaining `&mdash;` HTML entities should be `--` per project em dash rule | Mar 21 | Open |
| A-002 | Info | Database | `business_type` column in `clients` table is unused (all salon). Removing requires SQLite migration -- harmless for now. | Mar 9 | Open |

---

## Resolved Issues

| ID | Severity | Area | Description | Found | Resolved | Resolution |
|----|----------|------|-------------|-------|----------|------------|
| R-001 | Important | Intake Form | Form copy didn't match Karli's original Wix form voice | Mar 21 | Mar 21 | Updated intro, step copy, pre-booking notes, closing message, QR code |
| R-002 | Minor | Intake Form | QR code used raw `<img>` instead of Next.js `Image` component | Mar 21 | Mar 21 | Swapped to `Image` for pattern consistency |

---

## Tech Debt

| Area | Description | Priority | Notes |
|------|-------------|----------|-------|
| Intake Form | Answer options don't match Karli's Wix form (service types, hair history, color reaction, products, etc.) | High | Spec and plan needed -- next session priority |
| Intake Form | Products field is single textarea, should be 6 labeled inputs (Shampoo, Conditioner, Hair Spray, Dry Shampoo, Heat Protector, Other) | High | Part of options alignment |
| Intake Form | Color reaction is Yes/No/Not Sure, should be multi-select checkboxes (Itching, Burning, Swelling, etc.) | High | Part of options alignment |
| SMS | Twilio toll-free verification pending | Medium | Submitted March 21, 1-7 day approval |
| Email | Email lifecycle system not yet built (5 timed emails) | Medium | After intake alignment |
