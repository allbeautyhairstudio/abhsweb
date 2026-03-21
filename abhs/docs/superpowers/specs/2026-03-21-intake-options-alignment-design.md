## Intake Form Options Alignment -- Design Spec

**Date:** 2026-03-21
**Project:** All Beauty Hair Studio (ABHS)
**Scope:** Align intake form answer options with Karli's Wix form + WebP photo conversion
**Approach:** Wix is source of truth. Only add options from our side if genuinely impactful for inclusivity or consultation safety. Karli will audit the final form.

---

### Goal

Match the public intake form (`/newclientform`) to Karli's original Wix form options exactly, with minimal impactful additions. Two structural changes: products field becomes 6 labeled inputs, color reaction becomes multi-select checkboxes. All uploaded photos converted to WebP on the server.

---

### Changes by Field

#### 1. Contact Method

**Question:** "Which contact method is best to reach you?"
**Type change:** Single-select pills -> multi-select checkboxes
**New options:**
- Text
- Email
- Other

**Drops:** "Either is fine"
**Schema:** `preferred_contact` changes from `z.enum()` to `z.array(z.enum())` with min 1
**DB note:** `preferred_contact` column stores comma-separated values (e.g. "text,email")

#### 2. Service Interest

**Question:** "What service/s are you interested in?"
**Type change:** Single-select radio -> multi-select checkboxes
**New options:**
- `haircut-style` -- "Haircut & Style"
- `low-maintenance-color` -- "Low Maintenance Color"
- `dimensional-color` -- "Lived in Dimensional Color"
- `mini-service` -- "Mini Service"
- `other-not-sure` -- "Other/Not sure yet"

**Drops:** cut, color, cut-and-color, consultation, not-sure
**Schema:** `service_interest` changes from `z.enum()` to `z.array(z.enum())` with min 1

#### 3. Hair Type (renamed from "Hair Texture")

**Question:** "Please select one of the following that best describes your hair"
**Label change:** "Hair Texture" -> "Hair Type"
**New options:**
- `straight` -- "Straight"
- `curly` -- "Curly"
- `wavy` -- "Wavy"
- `frizzy-kinky` -- "Frizzy/Kinky"
- `coily` -- "Coily" *(our addition -- inclusive, real hair type)*

**Drops:** "Not Sure"
**Schema field rename:** `hair_texture` stays as field name (avoid DB migration), options update

#### 4. Hair Density (renamed from "Hair Type / Density")

**Question:** "How would you describe your hair texture?"
**Label change:** "Hair Type / Density" -> "Hair Texture" (matching Wix's label for this concept)
**New options:**
- `fine` -- "Fine"
- `medium` -- "Medium"
- `thick` -- "Thick"
- `very-thick` -- "Very Thick"
- `coarse` -- "Coarse"

**Drops:** "Fine / Thin" (split), "Thick / Coarse" (split), "Not Sure"
**Schema field:** `hair_density` stays as field name, options update

#### 5. Hair Length

**Question:** "Please select one of the following that best describes your hair length"
**New options:**
- `short` -- "Short"
- `medium` -- "Medium"
- `long` -- "Long"

**Drops:** "Very Long (past waist)" and descriptive parentheticals
**Schema:** `hair_length` options update

#### 6. Hair Condition

**Question:** "What is the current condition of your hair (Select all that apply)"
**New options:**
- `hair-loss` -- "Hair Loss"
- `split-ends` -- "Split Ends"
- `itchy-scalp` -- "Itchy Scalp"
- `dandruff` -- "Dandruff"
- `heat-damage` -- "Heat Damage"
- `breakage` -- "Breakage"
- `other` -- "Other"

**Drops:** healthy, damaged, dry, oily, frizzy, thinning, color-treated, chemically-treated, heat-damaged (replaced by heat-damage)
**Schema:** `hair_condition` array options update

#### 7. Styling Description

**Question:** "When it comes to your hair, which best describes you?"
**New options:**
- `low-maintenance` -- "I prefer low-maintenance, longer-lasting services"
- `grows-out-well` -- "I'm open to investing in hair that grows out well"
- `simple-predictable` -- "I like to keep things simple and predictable"
- `frequent-visits` -- "I enjoy frequent salon visits and detailed upkeep"

**Drops:** simple-styler, enjoys-styling, wants-change-nervous, no-idea
**Schema:** `styling_description` options update

#### 8. Daily Routine

**Question:** "What does your day-to-day hair routine usually look like?"
**New options:**
- `wash-and-go` -- "Wash & go"
- `style-when-needed` -- "I style it only when I need to"
- `blow-dryer-brush` -- "I'm pretty good with a blow-dryer & brush"
- `hot-tools-daily` -- "I style my hair most days using hot tools"
- `enjoys-styling` -- "My hair is part of my daily routine and I enjoy styling it"

**Drops:** quick-style, blow-dry-heat, varies-day-to-day
**Schema:** `daily_routine` options update

#### 9. Hair History

**Question:** "Let's talk hair history. Click all that apply within the last 2 years"
**New options:**
- `box-color` -- "Box Color"
- `henna` -- "Henna"
- `professional-color` -- "Professional Color"
- `splat` -- "Splat"
- `manic-panic` -- "Manic Panic"
- `previous-lightening` -- "Previous Lightening"
- `keratin` -- "Keratin Treatment" *(our addition -- chemical treatment, consultation safety)*
- `perm` -- "Perm" *(our addition -- chemical treatment, consultation safety)*
- `relaxer` -- "Relaxer" *(our addition -- chemical treatment, consultation safety)*
- `never-colored` -- "I have never colored my hair"

**Drops:** salon-color (replaced by professional-color), highlights-foils, balayage, bleach-lightener (replaced by previous-lightening), extensions, nothing (replaced by never-colored)
**Schema:** `hair_history` array options update

#### 10. Color Reaction -- STRUCTURAL CHANGE

**Question:** "Have you ever had a reaction to hair color before?"
**Type change:** Single-select pills (Yes/No/Not Sure) -> multi-select checkboxes
**New options:**
- `itching` -- "Itching"
- `burning` -- "Burning"
- `swelling` -- "Swelling"
- `sores-blisters` -- "Sores/Blisters"
- `rash-hives` -- "Rash/Hives"
- `other` -- "Other"
- `no-reaction` -- "No, I haven't" *(our addition -- allows answering without a reaction)*
- `not-sure` -- "Not sure" *(our addition -- preserves existing functionality)*

**Schema:** `color_reaction` changes from `z.enum()` to `z.array(z.enum())` with min 1

#### 11. Products -- STRUCTURAL CHANGE

**Question:** "What hair products do you currently use? Please specify brand."
**Type change:** Single textarea -> 6 labeled text inputs (all optional)
**New fields:**
- `product_shampoo` -- "Shampoo"
- `product_conditioner` -- "Conditioner"
- `product_hair_spray` -- "Hair Spray"
- `product_dry_shampoo` -- "Dry Shampoo"
- `product_heat_protector` -- "Heat Protector"
- `product_other` -- "Other"

**Drops:** `current_products` (single textarea)
**Schema:** Remove `current_products`, add 6 optional `z.string().max(200)` fields

#### 12. Maintenance Frequency

**Question:** "How often do you want to visit the salon for maintenance?"
**New options:**
- `3-5-weeks` -- "3-5 weeks"
- `6-8-weeks` -- "6-8 weeks"
- `10-12-weeks` -- "10-12 weeks"
- `every-6-months` -- "Every 6 Months"
- `once-a-year` -- "Once a Year"

**Drops:** every-4-6-weeks, every-8-12-weeks, every-3-6-months, as-needed, not-sure
**Schema:** `maintenance_frequency` options update

#### 13. Availability

**No change.** Keep our structured checkboxes (Tue/Wed/Thu morning/afternoon + Flexible). Better UX than Wix's free text, gives Karli structured scheduling data.

#### 14. Shampoo Frequency

**No change.** Wix had a dropdown (options not visible in screenshots). Our radio buttons are solid.

#### 15. Photos Copy Update

Update Step 6 description to Karli's Wix voice:
> "Now let's take a look! Attach some photos of yourself :) lemme see that gorgeous face! Please show how you normally wear your hair. Please take photos in good lighting if possible. Also attach some inspo photos. We're one step closer to creating the hair of your DREAMS!"

#### 16. Photo Upload -- WebP Conversion

**All uploaded photos converted to WebP immediately on the server.**
- Accept JPG, PNG, WebP, HEIC as before on the client
- In `/api/intake/upload`, use `sharp` to convert every uploaded file to WebP
- Quality: 80 (good balance of size vs quality for hair photos)
- Save as `.webp` in `data/uploads/{clientId}/`
- Original file format discarded after conversion
- File naming: `selfie-{n}-{hash}.webp`, `inspo-{n}-{hash}.webp`
- Add `sharp` to `pnpm.onlyBuiltDependencies` in package.json (native package)
- Existing uploads are NOT retroactively converted

---

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/intake-validation.ts` | Option arrays updated, schema type changes (enum->array for service_interest, preferred_contact, color_reaction), product fields added, current_products removed |
| `src/app/(public)/newclientform/page.tsx` | UI options updated, service interest + contact + color reaction changed to CheckboxGroup, products section replaced with 6 inputs, FormData interface updated, validation updated, submit payload updated, photos copy updated, question labels/descriptions updated |
| `src/app/api/intake/route.ts` | Handle new array fields (service_interest, preferred_contact, color_reaction), format product fields in intake note, update email HTML sections |
| `src/app/api/intake/upload/route.ts` | Add sharp import, convert all uploads to WebP before saving |
| `src/lib/salon-summary.ts` | Update `parseSalonIntakeNote()` for new field names/formats, update score calculations for new option values |
| `src/lib/constants/salon-scoring-rules.ts` | Update scoring references for new option values (service interest array, color reaction array, hair history values, styling description values) |
| `package.json` | Add `sharp` to dependencies and `pnpm.onlyBuiltDependencies` |
| Test files | Update all affected tests for new options/types |

---

### What Does NOT Change

- 7-step wizard structure
- Photo upload flow (accept same formats on client, max 6 files, 10MB each)
- Availability field (structured checkboxes)
- Shampoo frequency field
- Step 1 fields (name, pronouns, email, phone)
- Step 5 goals textarea (what_you_want)
- Step 7 medical_info, referral_source, consent
- Database table structure (salon intake stores data in client_notes as formatted text)
- Auth, rate limiting, sanitization
- Hair love/hate textarea (Step 2)
- Pre-booking notes, redirect note, closing message (updated last session)

---

### Backwards Compatibility with Existing Records

Existing intake records in `client_notes` use old option values (e.g. `"Color Reaction: Yes"`, `"Service Interest: Cut"`). New records will use new formats (e.g. `"Color Reaction: Itching, Burning"`, `"Service Interest: Haircut & Style, Low Maintenance Color"`).

**Strategy:** Include BOTH old and new display-format values in all scoring Sets. This is the simplest and safest approach -- no migration needed, old records continue to score correctly.

Specifically, these Sets in `salon-scoring-rules.ts` must include both old and new values:
- `COLOR_CORRECTION_SIGNALS`: add `'Box Color'`, `'Splat'`, `'Manic Panic'`, `'Previous Lightening'` alongside existing `'Box Dye'`, `'Bleach Lightener'`
- `CHEMICAL_SIGNALS`: `'Keratin'`, `'Perm'`, `'Relaxer'` (unchanged -- these values persist)
- `COMPOUNDING_CONDITIONS`: add `'Heat Damage'`, `'Breakage'`, `'Hair Loss'`, `'Itchy Scalp'`, `'Dandruff'` alongside existing `'Damaged'`, `'Color Treated'`, `'Chemically Treated'`, `'Heat Damaged'`, `'Thinning'`
- `SERVICE_LABELS`: add entries for new display values (`'Haircut & Style'`, `'Low Maintenance Color'`, `'Lived In Dimensional Color'`, `'Mini Service'`, `'Other Not Sure'`) alongside old entries

---

### ParsedSalonIntake Interface Changes

The `ParsedSalonIntake` interface in `salon-summary.ts` must be updated:
- `serviceInterest: string | null` -> `serviceInterest: string[]` (comma-split from note)
- `colorReaction: string | null` -> `colorReaction: string[]` (comma-split from note)
- `currentProducts: string | null` -> removed, replaced with `products: { shampoo: string | null; conditioner: string | null; hairSpray: string | null; dryShampoo: string | null; heatProtector: string | null; other: string | null }`

The parser (`parseSalonIntakeNote()`) must handle both old and new formats:
- Old: `"Service Interest: Cut"` -> `['Cut']`
- New: `"Service Interest: Haircut & Style, Low Maintenance Color"` -> `['Haircut & Style', 'Low Maintenance Color']`
- Old: `"Color Reaction: Yes"` -> `['Yes']`
- New: `"Color Reaction: Itching, Burning"` -> `['Itching', 'Burning']`
- Old: `"Current Products: Olaplex shampoo..."` -> products object with all null except other
- New: `"Shampoo: Redken"` lines -> products object with individual fields

---

### Note Format for Products

The intake note in `route.ts` will format products as:

```
--- PRODUCTS ---
Shampoo: Redken
Conditioner: Olaplex
Heat Protector: CHI 44 Iron Guard
```

Only non-empty fields are included. The parser reads each labeled line individually. If none are filled, the section is omitted.

---

### Array Handling in API Route

These lines in `route.ts` must be updated for array fields:

**Intake note builder:**
- `Service Interest: ${data.service_interest.map(formatLabel).join(', ')}` (was single formatLabel)
- `Preferred Contact: ${data.preferred_contact.map(formatLabel).join(', ')}` (was single formatLabel)
- `Color Reaction: ${data.color_reaction.map(formatLabel).join(', ')}` (was single formatLabel)
- Products section: iterate 6 fields, include non-empty ones

**DB insert:**
- `data.preferred_contact.join(',')` for the `preferred_contact` column (comma-separated string)

**SMS notification:**
- `data.service_interest.map(formatLabel).join(', ')` (was single formatLabel)

**Email HTML sections:**
- `Service Interest` value: `data.service_interest.map(formatLabel).join(', ')`
- `Color Reaction` value: `data.color_reaction.map(formatLabel).join(', ')`
- `Preferred Contact` value: `data.preferred_contact.map(formatLabel).join(', ')`
- Products: list non-empty product fields as `"Shampoo: X, Conditioner: Y"`

**ClientContactActions audit:** This component reads `preferred_contact` from the `clients` table. It must handle comma-separated values (e.g. `"text,email"`) by splitting on comma. The star indicator for "preferred" should highlight all selected methods.

---

### Scoring Engine Impact

**Readiness scoring adjustments:**
- `service_interest` is now an array -- score if array is non-empty (same points)
- Hair profile: `hair_texture` + `hair_length` + `hair_density` still contribute, new option values
- Hair history: new option values (box-color, professional-color, splat, manic-panic, previous-lightening, keratin, perm, relaxer, never-colored)

**Complexity scoring adjustments:**
- Color correction: check for `'Box Color'`, `'Splat'`, `'Manic Panic'`, `'Previous Lightening'` in treatments array (Sets include both old and new values)
- Chemical history: `'Keratin'`, `'Perm'`, `'Relaxer'` (same field names, still present)
- Color reaction: now an array -- flag if array contains any value other than `'No Reaction'` and `'Not Sure'`. Exact check: `intake.colorReaction.some(r => !['No Reaction', 'Not Sure', 'Yes', 'No', 'Not Sure'].includes(r))` OR `intake.colorReaction.includes('Yes')` (backwards compat for old records)
- Hair condition: new values in COMPOUNDING_CONDITIONS Set (includes both old and new)

**Flag logic updates:**
- `detectFlags()` color reaction check: replace `intake.colorReaction === 'Yes'` with `intake.colorReaction.some(r => !['No Reaction', 'Not Sure'].includes(r))` (also catches old `'Yes'` value since it's not in the exclusion list)
- "Good Fit" flag: update `maintenanceFrequency` check from `'Every 4 6 Weeks'` to also include `'3 5 Weeks'` and `'6 8 Weeks'`
- "Good Fit" flag: update `stylingDescription` check from `'Simple Styler'` to also include `'Low Maintenance'` and `'Simple Predictable'`

**Highlights updates:**
- `SERVICE_LABELS` record: add entries for all new display-format values
- `generateHighlights()`: handle `serviceInterest` as array -- join for display, use first value for label lookup

**Engagement scoring adjustments:**
- Products: score if any of the 6 product fields are filled (was: current_products text length). For backwards compat, also score if old `currentProducts` field is parsed.
- Other engagement scores unchanged in logic, just updated option values

---

### Testing Plan

- Run `npx vitest run` before and after -- all tests must pass (currently 225)
- Update existing tests for new option values in:
  - `intake-validation.test.ts` (if exists)
  - `salon-summary.test.ts` (60 tests -- many will need option value updates)
  - `booking-validation.test.ts` (unlikely affected)
- Add tests for:
  - Multi-select validation (service_interest, preferred_contact, color_reaction arrays)
  - Product fields validation (6 optional strings)
  - WebP conversion in upload route
- Visual verification on dev server for each step
- Verify email notification includes new field format

---

### Additions Beyond Wix (For Karli's Audit)

These 3 additions are flagged for Karli to review. She can remove any:

1. **Coily** (hair type) -- real hair type, inclusive (Pillar 4)
2. **Keratin, Perm, Relaxer** (hair history) -- chemical treatments relevant for consultation safety
3. **"No, I haven't" + "Not sure"** (color reaction) -- allows clients without reactions to answer the required field
