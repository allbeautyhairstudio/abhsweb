# Intake Form Options Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the public intake form with Karli's Wix form options, add WebP photo conversion, and maintain backwards compatibility with existing records.

**Architecture:** Update flows bottom-up: validation schema first (source of truth), then API route (data flow), then scoring engine (backwards-compat), then UI (consumer), then tests. Two structural changes (products, color reaction) plus option value updates across 12 fields.

**Tech Stack:** Next.js 16, TypeScript, Zod, SQLite, sharp (new), Vitest

**Spec:** `docs/superpowers/specs/2026-03-21-intake-options-alignment-design.md`

---

## Task Dependency Map

```
Wave 1: Task 1 (schema) + Task 5 (WebP) ── fully independent
Wave 2: Task 2 (API) + Task 3 (scoring) ── depend on Task 1, but edit different files from each other
Wave 3: Task 4 (UI) + Task 4b (ClientContactActions) ── depend on Task 1
Wave 4: Task 6 (tests) ── depends on all prior
Wave 5: Task 7 (verify + commit) ── final gate
```

**Parallelizable:** Wave 1 tasks are fully independent. Wave 2 tasks depend on Task 1 but can run in parallel with each other. Wave 3 tasks can run in parallel with each other.

---

## Task 1: Update Validation Schema

**Files:**
- Modify: `src/lib/intake-validation.ts`

**Subagent eligible:** Yes (independent file)

- [ ] **Step 1: Update option arrays**

Replace all option arrays with new values per spec:

```typescript
export const serviceInterestOptions = [
  'haircut-style', 'low-maintenance-color', 'dimensional-color',
  'mini-service', 'other-not-sure',
] as const;

export const hairTextureOptions = [
  'straight', 'curly', 'wavy', 'frizzy-kinky', 'coily',
] as const;

export const hairLengthOptions = [
  'short', 'medium', 'long',
] as const;

export const hairDensityOptions = [
  'fine', 'medium', 'thick', 'very-thick', 'coarse',
] as const;

export const hairConditionOptions = [
  'hair-loss', 'split-ends', 'itchy-scalp', 'dandruff',
  'heat-damage', 'breakage', 'other',
] as const;

export const stylingDescriptionOptions = [
  'low-maintenance', 'grows-out-well', 'simple-predictable', 'frequent-visits',
] as const;

export const dailyRoutineOptions = [
  'wash-and-go', 'style-when-needed', 'blow-dryer-brush',
  'hot-tools-daily', 'enjoys-styling',
] as const;

export const hairHistoryOptions = [
  'box-color', 'henna', 'professional-color', 'splat', 'manic-panic',
  'previous-lightening', 'keratin', 'perm', 'relaxer', 'never-colored',
] as const;

export const colorReactionOptions = [
  'itching', 'burning', 'swelling', 'sores-blisters',
  'rash-hives', 'other', 'no-reaction', 'not-sure',
] as const;

export const maintenanceFrequencyOptions = [
  '3-5-weeks', '6-8-weeks', '10-12-weeks',
  'every-6-months', 'once-a-year',
] as const;

export const contactMethodOptions = [
  'text', 'email', 'other',
] as const;
```

`availabilityOptions` and `shampooFrequencyOptions` — NO CHANGE.

- [ ] **Step 2: Update schema type changes**

Three fields change from `z.enum()` to `z.array(z.enum())`:

```typescript
// service_interest: was z.enum(), now array
service_interest: z.array(z.enum(serviceInterestOptions)).min(1, 'Select at least one'),

// preferred_contact: was z.enum(), now array
preferred_contact: z.array(z.enum(contactMethodOptions)).min(1, 'Select at least one'),

// color_reaction: was z.enum(), now array
color_reaction: z.array(z.enum(colorReactionOptions)).min(1, 'Select at least one'),
```

- [ ] **Step 3: Replace products field**

Remove `current_products` field. Add 6 optional product fields:

```typescript
// Step 4: Hair History — replace current_products with 6 product fields
product_shampoo: z.string().max(200).optional(),
product_conditioner: z.string().max(200).optional(),
product_hair_spray: z.string().max(200).optional(),
product_dry_shampoo: z.string().max(200).optional(),
product_heat_protector: z.string().max(200).optional(),
product_other: z.string().max(200).optional(),
```

- [ ] **Step 4: Verify schema file has no syntax errors**

Run: `cd c:/kar/abhs && npx tsc --noEmit` (will show type errors in consuming files -- expected, fixed in later tasks). Verify `intake-validation.ts` itself has no errors.

---

## Task 2: Update API Route

**Files:**
- Modify: `src/app/api/intake/route.ts`

**Subagent eligible:** Yes (independent file, but depends on Task 1 schema types)

**Run after:** Task 1

- [ ] **Step 1: Update intake note builder for array fields**

Replace single `formatLabel()` calls with `.map(formatLabel).join(', ')` for:
- `data.preferred_contact` (line ~93)
- `data.service_interest` (line ~96)
- `data.color_reaction` (line ~110)

- [ ] **Step 2: Replace products section in note**

Replace `Current Products` line with new products section:

```typescript
// Build products section
const productFields = [
  { label: 'Shampoo', value: data.product_shampoo },
  { label: 'Conditioner', value: data.product_conditioner },
  { label: 'Hair Spray', value: data.product_hair_spray },
  { label: 'Dry Shampoo', value: data.product_dry_shampoo },
  { label: 'Heat Protector', value: data.product_heat_protector },
  { label: 'Other', value: data.product_other },
].filter(p => p.value);

// In the intakeDetails array, replace the current_products line with:
productFields.length > 0 ? `\n--- PRODUCTS ---\n${productFields.map(p => `${p.label}: ${sanitizeString(p.value!)}`).join('\n')}` : null,
```

- [ ] **Step 3: Update DB insert for preferred_contact array**

```typescript
// Line ~139: join array for DB column
const result = insertClient.run(
  fullName, email, phone,
  data.preferred_contact.join(','),  // was: data.preferred_contact
  today, referralSource, today
);
```

- [ ] **Step 4: Update SMS notification**

```typescript
// Line ~151: service_interest is now array
const smsMsg = `New client: ${fullName} (${data.service_interest.map(formatLabel).join(', ')}). Check admin dashboard.`;
```

- [ ] **Step 5: Update email HTML sections**

Update `htmlSections` pushes for array fields:
- `Service Interest`: `data.service_interest.map(formatLabel).join(', ')`
- `Color Reaction`: `data.color_reaction.map(formatLabel).join(', ')`
- `Preferred Contact`: `data.preferred_contact.map(formatLabel).join(', ')`
- Replace `Current Products` with non-empty product fields joined

---

## Task 3: Update Scoring Engine (Backwards Compatible)

**Files:**
- Modify: `src/lib/constants/salon-scoring-rules.ts`
- Modify: `src/lib/salon-summary.ts`

**Subagent eligible:** Yes (independent files from Tasks 1-2)

- [ ] **Step 1: Update scoring constants — add new values alongside old**

In `salon-scoring-rules.ts`, update Sets to include BOTH old and new display-format values:

`COLOR_CORRECTION_SIGNALS`: Add `'Box Color'`, `'Splat'`, `'Manic Panic'`, `'Previous Lightening'` (keep existing `'Box Dye'`, `'Bleach Lightener'`)

`CHEMICAL_SIGNALS`: `'Keratin'`, `'Perm'`, `'Relaxer'` (unchanged)

`COMPOUNDING_CONDITIONS`: Add `'Heat Damage'`, `'Breakage'`, `'Hair Loss'`, `'Itchy Scalp'`, `'Dandruff'` (keep existing `'Damaged'`, `'Color Treated'`, `'Chemically Treated'`, `'Heat Damaged'`, `'Thinning'`)

`SERVICE_LABELS`: Add entries for `'Haircut & Style'`, `'Low Maintenance Color'`, `'Lived In Dimensional Color'`, `'Mini Service'`, `'Other Not Sure'` (keep old entries)

- [ ] **Step 2: Update ParsedSalonIntake interface**

In `salon-summary.ts`:

```typescript
interface ParsedSalonIntake {
  // ...existing fields...
  serviceInterest: string[];      // was: string | null
  colorReaction: string[];        // was: string | null
  // Remove: currentProducts: string | null
  products: {
    shampoo: string | null;
    conditioner: string | null;
    hairSpray: string | null;
    dryShampoo: string | null;
    heatProtector: string | null;
    other: string | null;
  };
}
```

- [ ] **Step 3: Update parseSalonIntakeNote() parser**

Handle both old and new formats:
- `serviceInterest`: Split `getField('Service Interest')` on `, ` → always return array
- `colorReaction`: Split `getField('Color Reaction')` on `, ` → always return array
- Products: Try reading individual lines (`Shampoo:`, `Conditioner:`, etc.). Fallback: read old `Current Products:` line into `products.other`

- [ ] **Step 4: Update scoring functions for new types**

- `calculateComplexityScore()`: Replace `intake.colorReaction === 'Yes'` with `intake.colorReaction.some(r => !['No Reaction', 'Not Sure'].includes(r))`
- `detectFlags()`: Same color reaction check update
- `detectFlags()` "Good Fit": Update `maintenanceFrequency` check to include `'3 5 Weeks'`, `'6 8 Weeks'` alongside old `'Every 4 6 Weeks'`
- `detectFlags()` "Good Fit": Update `stylingDescription` check to include `'Low Maintenance'`, `'Simple Predictable'` alongside old `'Simple Styler'`
- `generateHighlights()`: Handle `serviceInterest` as array — join for display
- `calculateEngagementScore()`: Score products based on any of 6 fields being filled (fallback: old `currentProducts`)

---

## Task 4: Update Form UI

**Files:**
- Modify: `src/app/(public)/newclientform/page.tsx`

**Run after:** Task 1 (needs updated schema types)

- [ ] **Step 1: Update option arrays at top of file**

Replace all option arrays (lines ~12-120) with new values per spec. Match exact labels from Wix screenshots.

- [ ] **Step 2: Update FormData interface**

```typescript
interface FormData {
  // Step 1 — no change to fields, but preferred_contact becomes string[]
  preferred_contact: string[];  // was: string

  // Step 2 — service_interest becomes string[]
  service_interest: string[];   // was: string

  // Step 4 — color_reaction becomes string[], products become 6 fields
  color_reaction: string[];     // was: string
  product_shampoo: string;
  product_conditioner: string;
  product_hair_spray: string;
  product_dry_shampoo: string;
  product_heat_protector: string;
  product_other: string;
  // Remove: current_products: string
}
```

Update `useState` initial values accordingly (arrays become `[]`, product fields become `''`).

- [ ] **Step 3: Update Step 1 — contact method**

Change `PillGroup` for `preferred_contact` to `CheckboxGroup`. Update handler from `handleRadio` to `handleCheckboxGroup`.

- [ ] **Step 4: Update Step 2 — service interest, hair fields**

- Service interest: `RadioGroup` → `CheckboxGroup`, handler → `handleCheckboxGroup`
- Hair texture label: "Hair Texture" → "Hair Type"
- Hair density label: "Hair Type / Density" → "Hair Texture"
- Update question text to match Wix

- [ ] **Step 5: Update Step 3 — styling + routine**

Update question labels to match Wix wording.

- [ ] **Step 6: Update Step 4 — history, color reaction, products**

- Hair history: update question text
- Color reaction: `PillGroup` → `CheckboxGroup`, handler → `handleCheckboxGroup`
- Products: Replace single textarea with 6 labeled text inputs

- [ ] **Step 7: Update Step 5 — maintenance frequency**

Update question text to match Wix.

- [ ] **Step 8: Update Step 6 — photos copy**

Replace description text with Karli's Wix voice:
> "Now let's take a look! Attach some photos of yourself :) lemme see that gorgeous face! Please show how you normally wear your hair. Please take photos in good lighting if possible. Also attach some inspo photos. We're one step closer to creating the hair of your DREAMS!"

- [ ] **Step 9: Update validation function**

- `validateStep(2)`: `service_interest` check → array length
- `validateStep(1)`: `preferred_contact` check → array length
- `validateStep(4)`: `color_reaction` check → array length, remove `current_products` check

- [ ] **Step 10: Update submit payload**

Update `handleSubmit` to send new field names and array types. Remove `current_products`, add 6 product fields.

- [ ] **Step 11: Fix mdash cleanup (A-001)**

Replace remaining `&mdash;` entities with `--` per project rules. 9 instances in the form.

---

## Task 4b: Update ClientContactActions for Multi-Select Contact

**Files:**
- Modify: `src/components/clients/client-contact-actions.tsx`

**Run after:** Task 1 (needs to understand new comma-separated format)
**Subagent eligible:** Yes (independent from Task 4, edits different file)

- [ ] **Step 1: Update preferred contact logic**

The `preferred_contact` DB column now stores comma-separated values (e.g. `"text,email"`). Update the component to split on comma and check with `.includes()` instead of `===`:

```typescript
// Old: preferredContact === 'email'
// New: preferredContact?.split(',').includes('email')
```

Update the star/preferred indicator to highlight ALL selected methods, not just one.

- [ ] **Step 2: Handle backwards compatibility**

Old records have single values (`"email"`, `"text"`, `"either"`). The `.split(',').includes()` pattern handles these correctly — `"email".split(',')` returns `["email"]`. The `"either"` value no longer exists in new records, but old records with `"either"` should show stars on both email and text.

- [ ] **Step 3: Verify in admin pages**

The component is used in: client detail, intake detail, intake queue, clients table, dashboard lists. Verify the preferred star renders correctly for both old and new records.

---

## Task 5: WebP Photo Conversion (INDEPENDENT — parallel)

**Files:**
- Modify: `src/app/api/intake/upload/route.ts`
- Modify: `package.json` (add sharp)

**Subagent eligible:** Yes (fully independent of Tasks 1-4)

- [ ] **Step 1: Install sharp**

Run: `cd c:/kar/abhs && pnpm add sharp`

- [ ] **Step 2: Add sharp to pnpm.onlyBuiltDependencies**

In `package.json`, add `"sharp"` to the `pnpm.onlyBuiltDependencies` array.

- [ ] **Step 3: Update upload route**

```typescript
import sharp from 'sharp';

// In the file write loop, replace direct buffer write with sharp conversion:
const buffer = Buffer.from(await file.arrayBuffer());
const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
const safeName = `selfie-${i + 1}-${crypto.randomBytes(4).toString('hex')}.webp`;
await writeFile(path.join(uploadDir, safeName), webpBuffer);
```

Apply same pattern for both selfie and inspiration loops. Always save as `.webp`.

- [ ] **Step 4: Verify sharp works**

Run: `cd c:/kar/abhs && node -e "const sharp = require('sharp'); console.log('sharp version:', sharp.versions)"`

---

## Task 6: Update Tests

**Files:**
- Modify: `src/lib/salon-summary.test.ts` (60 tests)
- Create or modify: `src/lib/intake-validation.test.ts`
- May modify other test files

**Run after:** Tasks 1-4b

- [ ] **Step 1: Add/update Zod validation tests**

Create or update `intake-validation.test.ts` with tests for:

- Multi-select arrays enforce `min(1)`: `service_interest`, `preferred_contact`, `color_reaction` must reject empty arrays
- Multi-select arrays accept valid values and reject invalid values
- Product fields accept strings up to 200 chars, reject longer
- Product fields are all optional (undefined is valid)

- [ ] **Step 2: Update salon-summary test fixtures**

All test data that uses old option values must be updated:

- `service_interest`: old single values → new array values
- `color_reaction`: old single values → new array values
- `hair_condition`: old values → new values
- `hair_history`: old values → new values
- `styling_description`: old values → new values
- `daily_routine`: old values → new values
- `maintenance_frequency`: old values → new values
- Products: old `current_products` → new product fields

- [ ] **Step 3: Update scoring test assertions**

Tests that check scores based on specific option values need updated thresholds and expected values. Flag/highlight tests that reference old values.

- [ ] **Step 4: Add backwards compatibility tests**

Add tests verifying the parser correctly handles OLD format notes (records created before this change):

- Old `"Color Reaction: Yes"` → parsed as `['Yes']`, triggers complexity flag
- Old `"Service Interest: Cut"` → parsed as `['Cut']`
- Old `"Current Products: Olaplex shampoo"` → parsed into `products.other`

- [ ] **Step 5: Add WebP conversion test**

Add test for the upload route's sharp conversion:

- Input: a valid JPEG/PNG buffer
- Expected: output file saved as `.webp`
- Verify sharp is called with `{ quality: 80 }`

- [ ] **Step 6: Run full test suite**

Run: `cd c:/kar/abhs && npx vitest run`

Expected: All tests pass (225+)

---

## Task 7: Verify, Fix mdash, Commit

**Run after:** All tasks complete

- [ ] **Step 1: Run full test suite**

Run: `cd c:/kar/abhs && npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Type check**

Run: `cd c:/kar/abhs && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Build**

Run: `cd c:/kar/abhs && pnpm build`
Expected: Production build succeeds

- [ ] **Step 4: Visual verification on dev server**

Run: `cd c:/kar/abhs && npx next dev -p 3005`
Walk through all 7 steps of the form. Verify:
- Step 1: Contact method shows checkboxes (Text, Email, Other)
- Step 2: Service interest shows checkboxes with Wix options, hair type/texture/density/length/condition updated
- Step 3: Styling + routine options match Wix
- Step 4: History options match Wix, color reaction is multi-select, 6 product inputs
- Step 5: Maintenance frequency matches Wix
- Step 6: Photos copy in Karli's voice
- Step 7: No changes needed
- Submit: verify no errors

- [ ] **Step 5: Commit all changes**

```bash
git add src/lib/intake-validation.ts \
  src/app/api/intake/route.ts \
  src/app/api/intake/upload/route.ts \
  src/lib/salon-summary.ts \
  src/lib/constants/salon-scoring-rules.ts \
  src/app/\(public\)/newclientform/page.tsx \
  src/components/clients/client-contact-actions.tsx \
  src/lib/salon-summary.test.ts \
  src/lib/intake-validation.test.ts \
  package.json pnpm-lock.yaml
git commit -m "feat: align intake form options with Karli's Wix form

- Match all answer options to Karli's original Wix form
- Service interest + contact + color reaction → multi-select
- Products → 6 labeled inputs (shampoo, conditioner, etc.)
- Photo uploads converted to WebP via sharp (quality 80)
- Backwards-compatible scoring for existing intake records
- Fix 9 mdash entities (A-001)
- Updates: schema, API, scoring engine, UI, tests"
```

---

## Execution Strategy

**Parallel subagent dispatch:**

| Wave | Tasks | Why parallel |
|------|-------|-------------|
| Wave 1 | Task 1 (schema) + Task 5 (WebP) | Fully independent files |
| Wave 2 | Task 2 (API) + Task 3 (scoring) | Both depend on Task 1, but edit different files |
| Wave 3 | Task 4 (UI) + Task 4b (ClientContactActions) | Both depend on Task 1, edit different files |
| Wave 4 | Task 6 (tests) | Depends on all prior tasks |
| Wave 5 | Task 7 (verify + commit) | Final gate -- Bas reviews |
