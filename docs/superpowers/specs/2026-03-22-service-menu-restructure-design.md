# Spec C: Service Menu Restructure

**Date:** 2026-03-22
**Status:** Approved
**Origin:** Karli Rosario's Website Strategy & Development Master List
**Scope:** Service description rewrites in `booking-services-data.ts` -- cut-forward language, positive framing, color repositioned as supporting the cut

---

## 1. Overview

The service menu keeps its current names, prices, durations, order, and badges. The descriptions are rewritten to position Karli as a cutting specialist and frame color as "lived-in enhancements" that support the haircut.

All copy follows positive framing -- lead with what it IS, not what it avoids or replaces.

---

## 2. Cutting Services -- Messaging Direction

### Artisan Cut ($85, "Most Popular")

**Current emphasis:** Customizable, tailored to texture/growth/lifestyle, advanced techniques.

**Shift to emphasize:**
- Technical precision -- this is Karli's craft
- Longevity -- "designed to look good for weeks, designed to fit your life"
- Structure -- the cut works with your hair's natural movement
- The grow-out -- "continues to look intentional as it grows"
- Less time styling, more time living

### Signature Cut ($65)

**Current emphasis:** Maintaining current cut, thoughtful upkeep/refinement.

**Shift to emphasize:**
- Preserving the structure and intention of the original design
- A refresh that honors the cut's foundation
- Longevity between full appointments
- Designed for clients who love their current shape

### Mini Services (Price varies)

**Current emphasis:** Touch-ups between full appointments, strategic adjustments.

**Shift to emphasize:**
- Maintaining the integrity of the cut between full appointments
- Strategic, not shortcuts -- every adjustment serves the overall design
- Keeps the structure working for you longer

---

## 3. Color Services -- Messaging Direction

All color services are repositioned as **"Lived-in Enhancements"** -- color that supports and illuminates the haircut's structure.

### Root Retouch ($90)

**Current emphasis:** Restoring balance when regrowth doesn't match.

**Shift to emphasize:**
- Restoring harmony between your color and your cut's structure
- Keeps the overall design feeling fresh and cohesive
- Soft gray blending as an option (already mentioned, keep it)

### All-Over Color / Base Enhancement ($160)

**Current emphasis:** Enhances/refreshes/shifts natural or existing base color.

**Shift to emphasize:**
- A lived-in enhancement that illuminates the dimension of your cut
- Color designed to grow out gracefully alongside your haircut
- Enriches what's already beautiful about your hair's structure

### Custom Color Sessions (3hr, 4hr, Extended)

**Current emphasis:** Time-based, fully customized, longer hair/bigger changes.

**Shift to emphasize:**
- Color as a creative layer that supports the cut's architecture
- Lived-in results that evolve gracefully
- The time investment serves longevity -- color that ages well
- Extended session: complex work handled with patience and precision

---

## 4. Consultation (Free)

**Current emphasis:** Clarity before committing, no pressure.

**Shift to emphasize:**
- Karli assesses the cut foundation first
- Then discusses color if relevant
- A conversation about your hair's potential, not a sales pitch
- Reinforce the cut-forward philosophy from the first interaction

---

## 5. Definition: "Lived-in Enhancement"

> **Lived-in Enhancement:** Color designed to complement the haircut's architecture, age gracefully with the grow-out, and reduce maintenance frequency. The color serves the cut -- not the other way around.

This phrase replaces the implicit positioning of color as an equal or primary service. Every color description should make the client feel that their haircut is the star, and color is the finishing touch that brings it to life.

---

## 6. Tone Rules for All Descriptions

| Do | Don't |
|----|-------|
| "Designed to look good for weeks, designed to fit your life" | "Won't fall apart after a week" |
| "Your cut continues to look intentional as it grows" | "No more awkward grow-out phases" |
| "Less time styling, more time living" | "Stop spending hours on your hair" |
| "Lived-in enhancement that illuminates your cut" | "Color isn't the main event" |
| "Designed to fit your life" | "Designed so you don't have to worry" |
| "Color designed to evolve with your cut" | "Color that doesn't need constant upkeep" |

- Positive framing always -- lead with what the client gets
- No negative comparisons
- No em dashes -- the current data file has 15+ Unicode em dashes (`\u2014`) that must ALL be replaced with hyphens or double dashes
- Curly apostrophes (`\u2019`) -- keep as-is (they render correctly and look polished)
- Warm, confident, Karli's voice
- Cut is the foundation; color enhances it
- Every service description should make someone feel excited about what they're choosing

---

## 7. Technical Details

### What Changes

- `description` strings for all 9 services rewritten with cut-forward language
- `bulletPoints` arrays (on Artisan Cut, Root Retouch, All-Over Color, Mini Services) also rewritten to match the cut-forward positioning
- All em dashes replaced throughout the file
- This is a creative brief -- final copy will be written during implementation, following the direction and tone rules in this spec

### Files Affected

- `src/content/booking-services-data.ts` -- all description strings and bulletPoints updated
- `src/components/booking/service-picker.tsx` -- verify only (no code changes expected, but confirm descriptions render correctly)

### What Does NOT Change

- Service names
- Prices
- Durations
- Sort order
- Badges ("Free", "Most Popular")
- Service IDs or any data structure
- Component code (service-picker.tsx displays whatever is in the data file)

### Testing

- Existing booking validation tests should pass unchanged (they test schema, not copy)
- No new tests needed (this is a copy-only change)
- Verify zero em dashes remain: grep for `\u2014` in the data file
- Visual verification on dev server to confirm descriptions render correctly

---

## Out of Scope

- Service reordering (stays as-is)
- Service renaming (names stay as-is)
- Price changes
- New services
- Booking flow changes
- Square integration changes
- Intake form service interest options (separate file, separate concern)
- AI chat service references (chat uses live service data)

---

## Success Criteria

1. Every cutting service description leads with precision, longevity, and structure
2. Every color service description positions color as a "lived-in enhancement" supporting the cut
3. Consultation description leads with cut assessment, color secondary
4. Mini services description frames touch-ups as maintaining cut integrity
5. All `bulletPoints` arrays updated to match cut-forward positioning
6. All copy uses positive framing -- no negative comparisons
7. Zero em dashes in the file (verified by grep)
8. Tone is warm, confident, and sounds like Karli
9. All existing tests pass
10. Build succeeds
11. Descriptions render correctly on dev server booking page
