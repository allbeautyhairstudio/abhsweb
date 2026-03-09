# AI Marketing Reset Dashboard — Codebase Audit

> **Based on Bas's Comprehensive Codebase Audit Template**
> Adapted for: Next.js 16 + SQLite + Tailwind + shadcn/ui + Vitest

---

## 1. Health Dashboard

| Dimension         | Score    | Grade | Notes                                                      |
|-------------------|----------|-------|------------------------------------------------------------|
| Quality Gates     | 4/5      | B+    | 4/5 pass; lint has 1 warning, npm audit has dev-only vulns |
| Code Quality      | 9/10     | A     | Zero `any`, strict mode, clean patterns, 1 unused import   |
| Security          | 6/10     | C     | SQL column injection risk, no Zod on API routes yet        |
| Accessibility     | 6/10     | C     | Good foundation, missing skip-link and a11y testing        |
| Performance       | 8/10     | B+    | Server components, optimized fonts, small bundle           |
| i18n              | N/A      | N/A   | Single-language (English only)                             |
| Test Coverage     | 5/10     | D     | 52 tests but only 2 files covered; no coverage tooling     |
| Tech Debt         | 7/10     | B     | Small codebase, known gaps are planned for Phase 2         |
| Dependencies      | 6/10     | C     | 14 dev-only vulns, 8 unused packages                       |
| Documentation     | 8/10     | B+    | Excellent handoff + RAI policy, no README in dashboard     |
| File Organization | 9/10     | A     | Clean structure, no bloat, no oversized files              |
| **Overall**       | **7/10** | **B** | Solid Phase 1 foundation with known security gaps to fix   |

**Grading:** A+ = 10, A = 9, B+ = 8, B = 7, C = 6, D = 5, F = <5

---

## 2. Quality Gates

| Gate       | Command            | Status | Notes                                                    |
|------------|--------------------|--------|----------------------------------------------------------|
| Lint       | `npx eslint src/`  | WARN   | 0 errors, 1 warning: unused `FileText` import in sidebar |
| Type Check | `npx tsc --noEmit` | PASS   | Zero errors, strict mode enabled                         |
| Build      | `npx next build`   | PASS   | Compiled in 1.6s, 4 routes (1 static, 3 dynamic)         |
| Unit Tests | `npx vitest run`   | PASS   | 52/52 tests passing (25 sanitize + 27 validation)        |
| Dep Audit  | `npm audit`        | FAIL   | 14 high severity — all `minimatch` ReDoS, all dev-only   |

**Summary:** 4/5 gates pass. Dep audit failure is dev-only (eslint chain). Not a production risk.

---

## 3. Codebase Metrics

| Metric                         | Value |
|--------------------------------|-------|
| Source files (.ts/.tsx)         | 27   |
| Lines of code (approx)         | 2,415 |
| Components (total)             | 13    |
| Pages/routes                   | 1     |
| API routes/endpoints           | 2     |
| Custom hooks                   | 0     |
| Type definition files          | 0     |
| Utility/helper files           | 7     |
| Production dependencies        | 12    |
| Dev dependencies               | 17    |
| Test files                     | 2     |
| Test cases (total)             | 52    |

---

## 4. Security Audit

### 4.1 Secrets & Credentials

| Check                                    | Status | Notes                                              |
|------------------------------------------|--------|----------------------------------------------------|
| No secrets in source code                | PASS   | No API keys, tokens, or passwords found            |
| No .env files in git                     | PASS   | No .env files tracked                              |
| .env.example has names only (no values)  | N/A    | No .env files exist (local SQLite, no secrets)     |
| Server-only secrets not exposed to client | PASS  | No secrets to expose                               |
| Git history clean of secrets             | PASS   | Only false positive: doc text about "secret vault" |

### 4.2 Injection Prevention

| Check                                              | Status   | Notes                                                            |
|----------------------------------------------------|----------|------------------------------------------------------------------|
| All user input validated server-side               | **FAIL** | Zod schemas exist but NOT wired into API routes yet (Issue #1)   |
| Parameterized queries (no string concatenation)    | **WARN** | Values parameterized, but column NAMES built from user keys (#2) |
| No `dangerouslySetInnerHTML` without sanitization  | PASS     | None found                                                       |
| No `eval()` or `Function()` with user input        | PASS     | None found                                                       |
| No raw SQL queries                                 | PASS     | All use `.prepare()` with parameterized values                   |

**CRITICAL FINDING — Issue #2:** `createClient()` and `updateClient()` in [clients.ts:104-125](src/lib/queries/clients.ts#L104-L125) dynamically build SQL column names from `Object.keys(data)`. While values are parameterized, the column names are interpolated directly into the SQL string:
```typescript
const fields = Object.keys(data);
// fields are injected directly: INSERT INTO clients (${fields.join(', ')})
```
An attacker could pass a malicious key like `"id; DROP TABLE clients--"` to manipulate the query. **Fix:** Add an allowlist of valid column names and reject any key not in the list.

**HIGH FINDING — Issue #1:** POST `/api/clients` and PUT `/api/clients/[id]` accept `request.json()` without Zod validation or sanitization. The schemas exist in `validation.ts` but aren't applied. **Fix:** Wire Zod schemas into API routes (planned for Phase 2).

### 4.3 Authentication & Authorization

| Check                                             | Status | Notes                             |
|---------------------------------------------------|--------|-----------------------------------|
| Protected routes require authentication           | N/A    | Local-only dashboard, single user |
| Session tokens in httpOnly cookies                | N/A    | No auth system                    |
| Session timeout configured                        | N/A    | No sessions                       |
| Login rate limiting                               | N/A    | No login                          |
| RBAC/permissions enforced server-side             | N/A    | Single user                       |
| Auth state verified server-side                   | N/A    | No auth                           |

**Note:** Auth is intentionally out of scope — this is a local localhost dashboard for a single operator (Karli). If this ever moves to a hosted deployment, auth becomes CRITICAL.

### 4.4 CSRF & Request Integrity

| Check                                                  | Status | Notes                            |
|--------------------------------------------------------|--------|----------------------------------|
| CSRF tokens or Origin header verification              | N/A    | Local only, no cross-origin risk |
| State-changing operations use POST/PUT/DELETE (not GET) | PASS  | Correct HTTP methods used        |
| API routes validate request origin                     | N/A    | Local only                       |

### 4.5 Security Headers

| Header                    | Expected Value                  | Actual  | Status |
|---------------------------|---------------------------------|---------|--------|
| Content-Security-Policy   | Restrictive policy              | Not set | N/A    |
| X-Frame-Options           | DENY or SAMEORIGIN              | Not set | N/A    |
| X-Content-Type-Options    | nosniff                         | Not set | N/A    |
| Referrer-Policy           | strict-origin-when-cross-origin | Not set | N/A    |
| Permissions-Policy        | Restrictive                     | Not set | N/A    |
| Strict-Transport-Security | max-age=31536000                | Not set | N/A    |

**Note:** No `middleware.ts` exists. Security headers are not required for localhost but should be added if the app ever goes online. Flagged as tech debt for Phase 7.

### 4.6 PII & Data Privacy

| Check                                         | Status | Notes                                           |
|-----------------------------------------------|--------|-------------------------------------------------|
| No PII in logs (names, emails, phone numbers) | PASS   | Zero `console.log` statements in source         |
| No PII in error messages returned to client   | PASS   | Generic error messages only                     |
| Data retention policy implemented             | WARN   | No auto-purge; manual delete exists via API     |
| Data deletion capability exists (GDPR/CCPA)   | PASS   | DELETE `/api/clients/[id]` exists               |
| Minimal data collection (only what's needed)  | PASS   | All 48 fields serve the analysis pipeline       |
| Children's data protected (COPPA)             | N/A    | B2B service, no children's data                 |

### 4.7 Error Handling

| Check                                      | Status   | Notes                                                       |
|--------------------------------------------|----------|-------------------------------------------------------------|
| No stack traces exposed to users           | **WARN** | No try/catch in API routes — unhandled errors may leak (#3) |
| No internal paths exposed in error messages | PASS    | Custom error messages used                                  |
| No database error details exposed          | **WARN** | SQLite errors would propagate to client without try/catch   |
| Generic error messages on client           | PASS     | "Client name is required", "Client not found"               |
| Errors logged server-side for debugging    | WARN     | No logging infrastructure yet                               |

### 4.8 Rate Limiting

| Endpoint/Action  | Limit   | Implemented | Notes      |
|------------------|---------|-------------|------------|
| Form submissions | /hr/IP  | N/A         | Local only |
| API endpoints    | /min/IP | N/A         | Local only |

---

## 5. Code Quality Audit

### 5.1 Type Safety

| Check                              | Status | Count | Notes                                                    |
|------------------------------------|--------|-------|----------------------------------------------------------|
| No `any` types                     | PASS   | 0     | Zero `any` in entire codebase                            |
| No `!` non-null assertions         | PASS   | 0     | None found                                               |
| No unsafe `as` type assertions     | WARN   | 7     | All in clients.ts for better-sqlite3 returns (necessary) |
| Return types on exported functions | PASS   | —     | TypeScript strict mode infers return types               |
| Strict mode enabled                | PASS   | —     | `"strict": true` in tsconfig.json                        |

**Note on `as` assertions:** The 7 type assertions in `clients.ts` are necessary because `better-sqlite3`'s `.get()` and `.all()` return `unknown`. These are safe — the types match the schema. No action needed.

### 5.2 Code Patterns

| Check                                    | Status | Notes                                      |
|------------------------------------------|--------|--------------------------------------------|
| Consistent naming conventions            | PASS   | camelCase functions, PascalCase components  |
| One component per file                   | PASS   | All components in separate files            |
| Consistent import ordering               | PASS   | Framework → lib → components → styles      |
| No unused imports/variables              | WARN   | 1 — `FileText` in sidebar.tsx (Issue #4)   |
| No dead code / commented-out code        | PASS   | Clean codebase                             |
| No TODO/FIXME/HACK without issue links   | PASS   | Zero TODOs/FIXMEs found                    |
| No duplicate logic that should be shared | PASS   | —                                          |
| Error boundaries for critical sections   | PASS   | React Error Boundary in error-boundary.tsx |

### 5.3 Lint & Format

| Check                                     | Status | Notes                                |
|-------------------------------------------|--------|--------------------------------------|
| Zero lint errors                          | PASS   | 0 errors                            |
| Zero lint warnings                        | WARN   | 1 warning (unused import)           |
| No `eslint-disable` without justification | PASS   | Zero suppressions in entire codebase |
| Consistent formatting (Prettier/dprint)   | WARN   | No formatter configured              |

---

## 6. Accessibility Audit (WCAG 2.1 AA)

### 6.1 Automated Checks

No automated accessibility testing configured yet. `@axe-core/playwright` planned for Phase 7 (E2E tests).

### 6.2 Manual Checklist

| Requirement                                           | Status   | Notes                                                    |
|-------------------------------------------------------|----------|----------------------------------------------------------|
| Skip-to-content link on every page                    | **FAIL** | Not implemented (Issue #5)                               |
| All images have appropriate alt text                  | N/A      | No images yet                                            |
| Color contrast 4.5:1 minimum (text)                   | WARN     | Warm palette needs verification with contrast checker    |
| Color contrast 3:1 minimum (large text, UI)           | WARN     | Warm palette needs verification                          |
| All interactive elements keyboard-accessible          | PASS     | Using native `<a>`, `<button>` via shadcn/ui             |
| Visible focus indicators on all focusable elements    | PASS     | Tailwind `ring` utilities on shadcn components           |
| Semantic HTML (`<button>`, `<a>`, `<nav>`, `<main>`)  | PASS     | `<main>` in layout, `<nav>` in sidebar, native elements  |
| ARIA used only as supplement (not replacement)        | PASS     | Minimal ARIA, native semantics used                      |
| Every form input has a linked `<label>`               | N/A      | No forms yet (Phase 2)                                   |
| Related inputs grouped in `<fieldset>` + `<legend>`   | N/A      | No forms yet                                             |
| Error messages linked via `aria-describedby`          | N/A      | No form validation UI yet                                |
| `aria-live` regions for dynamic content               | WARN     | Not implemented for status updates                       |
| `prefers-reduced-motion` respected                    | WARN     | Not explicitly tested; Tailwind transitions are subtle   |
| Touch targets 44x44px minimum (mobile)                | WARN     | Pipeline stage links may be too small on mobile          |
| Content readable at 200% zoom (no h-scroll)           | WARN     | Sidebar is fixed 240px — may cause h-scroll at zoom     |
| Heading hierarchy (h1 → h2 → h3, no skips)           | PASS     | h1 "Dashboard", card titles are h3 via CardTitle         |
| Decorative images/icons have `aria-hidden="true"`     | WARN     | Lucide icons don't have explicit aria-hidden             |
| Page titles are unique and descriptive                | PASS     | "AI Marketing Reset — Dashboard"                         |
| Language attribute set on `<html>`                    | PASS     | `<html lang="en">` in layout.tsx                         |

---

## 7. Performance Audit

### 7.1 Core Web Vitals

Not measured yet — app runs locally at localhost:3000. Lighthouse scores deferred to Phase 7.

### 7.2 Asset Optimization

| Check                                              | Status | Notes                                    |
|----------------------------------------------------|--------|------------------------------------------|
| Images optimized (WebP/AVIF, responsive sizes)     | N/A    | No images yet                            |
| No raw `<img>` tags (use Next.js Image component)  | N/A    | No images yet                            |
| Fonts loaded optimally (no layout shift)           | PASS   | Using `next/font/google` with subsetting |
| Font subsetting (Latin-only if applicable)         | PASS   | `subsets: ["latin"]` configured          |
| Lazy loading for below-fold content                | N/A    | Single page, small content               |
| Hero/above-fold images prioritized                 | N/A    | No images                                |

### 7.3 JavaScript & Bundle

| Check                                                 | Status | Notes                                        |
|-------------------------------------------------------|--------|----------------------------------------------|
| Server components by default (React/Next.js)          | PASS   | `page.tsx` is a server component             |
| Dynamic imports for heavy components                  | N/A    | No heavy components yet                      |
| Tree-shaken imports (named, not wildcard)             | PASS   | Named imports throughout                     |
| No packages >50KB gzipped without justification       | PASS   | Small dependency footprint                   |
| No duplicate functionality (e.g., moment + date-fns)  | PASS   | No overlap                                   |
| Bundle analyzer run, no surprises                     | WARN   | Not run; no `@next/bundle-analyzer` installed |

### 7.4 Data Fetching & Caching

| Check                                         | Status | Notes                                                                   |
|-----------------------------------------------|--------|-------------------------------------------------------------------------|
| Server-side fetching where possible           | PASS   | Dashboard page fetches server-side via direct DB calls                  |
| Appropriate Cache-Control headers             | N/A    | Local only                                                              |
| External API responses cached                 | N/A    | No external APIs                                                        |
| API timeouts configured (no hanging requests) | N/A    | Local SQLite, sub-millisecond queries                                   |
| No unbounded database queries (pagination)    | WARN   | `getAllClients()` returns ALL clients — needs pagination for scale (#6) |
| Specific column selection (no SELECT *)       | WARN   | Multiple queries use `SELECT *` — could be optimized (#7)              |

---

## 8. i18n Audit

> **SKIPPED** — Single-language project (English only). Not applicable.

---

## 9. Test Coverage Audit

### 9.1 Coverage Report

**Coverage tooling not installed.** `@vitest/coverage-v8` is missing.

| Category                     | Target | Actual  | Status   |
|------------------------------|--------|---------|----------|
| Validation/schemas           | 100%   | ~100%   | PASS     |
| Utility functions            | 90%    | ~100%   | PASS     |
| API clients                  | 80%    | 0%      | **FAIL** |
| Hooks/state logic            | 80%    | N/A     | N/A      |
| Server actions/API routes    | 80%    | 0%      | **FAIL** |
| Components (critical paths)  | 70%    | 0%      | **FAIL** |
| Overall                      | 70%    | ~25-30% | **FAIL** |

### 9.2 Test Types Present

| Test Type                      | Files | Cases | Status   |
|--------------------------------|-------|-------|----------|
| Unit tests                     | 2     | 52    | PASS     |
| Integration tests              | 0     | 0     | **FAIL** |
| E2E tests                      | 0     | 0     | Planned  |
| Accessibility tests (axe-core) | 0     | 0     | Planned  |
| Visual regression tests        | 0     | 0     | N/A      |

### 9.3 Critical Paths Tested

| User Flow                 | Unit    | E2E | Notes                                    |
|---------------------------|---------|-----|------------------------------------------|
| Add new client            | NO      | NO  | API route untested (Issue #8)            |
| View client list          | NO      | NO  | Query + page untested                    |
| Edit client data          | NO      | NO  | PUT route untested                       |
| Delete client             | NO      | NO  | DELETE route untested                    |
| Dashboard metrics display | NO      | NO  | Server component, needs integration test |
| Error states & recovery   | PARTIAL | NO  | Error boundary exists but untested       |

---

## 10. Dependency Audit

### 10.1 Vulnerability Scan

```
npm audit — 14 high severity vulnerabilities
```

| Severity | Count | Production | Dev-Only | Notes                                  |
|----------|-------|------------|----------|----------------------------------------|
| Critical | 0     | 0          | 0        | —                                      |
| High     | 14    | 0          | 14       | All `minimatch` ReDoS via eslint chain |
| Moderate | 0     | 0          | 0        | —                                      |
| Low      | 0     | 0          | 0        | —                                      |

**All 14 vulnerabilities are dev-only** (eslint toolchain). Zero production vulnerabilities. The `minimatch` ReDoS issue requires eslint to update to a version with fixed dependencies. Not actionable by us — upstream fix needed.

### 10.2 Dependency Health

| Check                                   | Status   | Notes                                           |
|-----------------------------------------|----------|-------------------------------------------------|
| No unused dependencies                  | **FAIL** | 2 unused prod: `date-fns`, `marked` (Issue #9)  |
| No missing dependencies                 | WARN     | `@vitest/coverage-v8` missing for coverage       |
| No duplicate functionality packages     | PASS     | —                                               |
| No deprecated packages                  | PASS     | —                                               |
| Major versions pinned                   | PASS     | Lock file committed                             |
| Lock file committed                     | PASS     | `package-lock.json` present                     |
| No packages with <1000 weekly downloads | PASS     | All well-established packages                   |

**Unused dependencies found by depcheck:**

| Package                  | Type | Notes                                       |
|--------------------------|------|---------------------------------------------|
| `date-fns`               | Prod | Not imported anywhere yet — remove or defer |
| `marked`                 | Prod | Not imported anywhere yet — remove or defer |
| `@tailwindcss/postcss`   | Dev  | Used by build system, likely false positive  |
| `@testing-library/react` | Dev  | Installed for Phase 2 component tests        |
| `@types/marked`          | Dev  | Types for unused `marked` — remove with it   |
| `shadcn`                 | Dev  | CLI tool, not imported — expected            |
| `tailwindcss`            | Dev  | Used by build system, false positive         |
| `tw-animate-css`         | Dev  | Used in CSS, false positive                  |

**Action:** Remove `date-fns`, `marked`, and `@types/marked` now. They can be re-added when needed.

---

## 11. Tech Debt Register

| ID  | Item                                        | Type          | Impact   | Effort | Phase   |
|-----|---------------------------------------------|---------------|----------|--------|---------|
| T1  | API routes missing Zod validation           | Incomplete    | HIGH     | Small  | Phase 2 |
| T2  | API routes missing input sanitization       | Incomplete    | HIGH     | Small  | Phase 2 |
| T3  | API routes missing try/catch error handling | Incomplete    | MEDIUM   | Small  | Phase 2 |
| T4  | SQL column name injection in create/update  | Security gap  | CRITICAL | Tiny   | Phase 2 |
| T5  | No test coverage tooling (`coverage-v8`)    | Testing gap   | MEDIUM   | Tiny   | Phase 2 |
| T6  | No integration tests for API routes         | Testing gap   | HIGH     | Medium | Phase 2 |
| T7  | No component tests                          | Testing gap   | MEDIUM   | Medium | Phase 2+ |
| T8  | No formatter (Prettier) configured          | Design debt   | LOW      | Tiny   | Any     |
| T9  | Unused prod dependencies                    | Cleanup       | LOW      | Tiny   | Now     |
| T10 | No skip-to-content link                     | Accessibility | MEDIUM   | Tiny   | Phase 2 |
| T11 | Security headers not configured             | Security gap  | LOW      | Small  | Phase 7 |
| T12 | `SELECT *` in multiple queries              | Performance   | LOW      | Small  | Phase 3+ |
| T13 | No pagination on `getAllClients()`           | Performance   | LOW      | Small  | Phase 2 |
| T14 | No bundle analyzer                          | Performance   | LOW      | Tiny   | Phase 6 |

**Types:** Incomplete, Workaround, Performance gap, Testing gap, Design debt, Migration needed, Security gap, Cleanup, Accessibility
**Impact:** Critical, High, Medium, Low
**Effort:** Large (>1 week), Medium (2-5 days), Small (1 day), Tiny (<1 hour)

---

## 12. File Organization & Documentation

### 12.1 File Organization

| Check                                           | Status | Notes                                                    |
|-------------------------------------------------|--------|----------------------------------------------------------|
| Consistent directory structure                  | PASS   | Clean app router structure (app/, lib/, components/)     |
| Naming conventions followed                     | PASS   | kebab-case files, PascalCase components, camelCase fns   |
| No orphaned/unused files                        | PASS   | All files serve a purpose                                |
| No oversized files (>500 lines)                 | PASS   | Largest: validation.test.ts at 256 lines                 |
| Config files at project root                    | PASS   | next.config.ts, vitest.config.ts, tsconfig.json at root |
| .gitignore covers all generated/sensitive files | WARN   | Missing: `src/data/` (SQLite DB + backups) (Issue #10)   |
| No duplicate files                              | PASS   | —                                                        |

### 12.2 Documentation

| Document               | Exists | Current | Notes                                         |
|------------------------|--------|---------|-----------------------------------------------|
| README.md              | NO     | —       | No dashboard README (Issue #11)               |
| Contributing guide     | N/A    | —       | Single-dev project                            |
| API documentation      | NO     | —       | Routes undocumented (can defer)               |
| Architecture decisions | YES    | YES     | Build plan + handoff.md cover this thoroughly |
| Environment setup guide | NO    | —       | Covered in handoff Section 24                 |
| Deployment guide       | NO     | —       | Planned for Phase 7 (start-dashboard.bat)     |
| RAI Policy             | YES    | YES     | RAI-POLICY.md in project root                 |

---

## 13. Issues Tracker

### How to Classify

| Severity | Definition                                        | SLA                     |
|----------|---------------------------------------------------|-------------------------|
| CRITICAL | Security vulnerability, data loss risk, app crash | Fix immediately         |
| HIGH     | Broken functionality, significant UX degradation  | Fix before next release |
| MEDIUM   | Standards violation, moderate UX issue             | Fix within 2 sprints    |
| LOW      | Minor polish, code cleanliness                    | Fix when convenient     |

### Found Issues

| ID  | Severity | Category       | Issue                                                 | Location                             | Effort |
|-----|----------|----------------|-------------------------------------------------------|--------------------------------------|--------|
| #1  | HIGH     | Security       | API routes accept raw JSON without Zod validation     | `src/app/api/clients/route.ts`       | Small  |
| #2  | CRITICAL | Security       | SQL column names built from user-supplied object keys | `src/lib/queries/clients.ts:104-125` | Tiny   |
| #3  | MEDIUM   | Error Handling | No try/catch in API routes — errors may leak          | `src/app/api/clients/*.ts`           | Small  |
| #4  | LOW      | Code Quality   | Unused import `FileText` in sidebar                   | `src/components/layout/sidebar.tsx:9` | Tiny   |
| #5  | MEDIUM   | Accessibility  | No skip-to-content link                               | `src/app/layout.tsx`                 | Tiny   |
| #6  | LOW      | Performance    | `getAllClients()` returns unbounded results            | `src/lib/queries/clients.ts:74`      | Small  |
| #7  | LOW      | Performance    | Multiple queries use `SELECT *` instead of named cols | `src/lib/queries/clients.ts`         | Small  |
| #8  | HIGH     | Testing        | Zero integration tests for API routes                 | `src/app/api/`                       | Medium |
| #9  | LOW      | Dependencies   | Unused prod dependencies: `date-fns`, `marked`        | `package.json`                       | Tiny   |
| #10 | MEDIUM   | Security       | `.gitignore` missing `src/data/` (SQLite DB with PII) | `.gitignore`                         | Tiny   |
| #11 | LOW      | Documentation  | No README.md for the dashboard project                | Project root                         | Small  |

### Deferred Issues

| ID  | Severity | Issue                    | Deferred To | Reason                              |
|-----|----------|--------------------------|-------------|-------------------------------------|
| #6  | LOW      | Unbounded query results  | Phase 2     | Max 8 clients/month, not urgent yet |
| #7  | LOW      | `SELECT *` usage         | Phase 3+    | Performance fine at current scale   |
| #8  | HIGH     | No API integration tests | Phase 2     | Routes will be rebuilt with Zod     |
| #11 | LOW      | No README                | Phase 7     | Handoff doc covers setup            |

---

## 14. Audit Summary

**Date:** 2026-02-23
**Auditor:** Claude (requested by Bas)
**Codebase:** AI Marketing Reset Dashboard (`c:\kar\backendworkflow\`)
**Commit:** `ddf0b20` (main)

### Key Findings

1. **CRITICAL: SQL column name injection** — `createClient()` and `updateClient()` build SQL column names from user-supplied object keys without an allowlist. Must fix before Phase 2 builds on top of these functions.
2. **HIGH: API routes lack validation** — Zod schemas and sanitization exist but aren't wired into the API routes. All input goes straight to the database unsanitized.
3. **Testing gap** — 52 tests cover only 2 utility files. Zero tests for API routes, queries, components, or the dashboard page. Coverage tooling not installed.
4. **Dependencies** — 14 dev-only vulnerabilities (upstream eslint chain), 2 unused production packages.
5. **Strong foundation** — Zero `any` types, zero lint errors, strict mode, clean architecture, excellent documentation, zero console.log statements, no dead code.

### Critical Actions Required

1. **Add column allowlist to `createClient()` and `updateClient()`** — Validate all keys against the known schema columns before building SQL. Reject unknown keys. (Effort: Tiny)
2. **Wire Zod validation + sanitization into API routes** — Apply the existing schemas in `validation.ts` and `sanitize.ts` to POST and PUT handlers. (Effort: Small, planned for Phase 2)
3. **Add `src/data/` to `.gitignore`** — Prevent SQLite database files (containing client PII) from being committed to git. (Effort: Tiny)

### Recommendations

1. **Install `@vitest/coverage-v8`** and add coverage thresholds to vitest.config.ts
2. **Remove unused dependencies** (`date-fns`, `marked`, `@types/marked`) to reduce surface area
3. **Add try/catch error handling** to all API route handlers when rebuilding them in Phase 2
4. **Add skip-to-content link** to layout.tsx for accessibility
5. **Consider adding Prettier** for consistent formatting across the team
6. **Run this audit again after Phase 2** when API routes are rebuilt with full validation

### Next Audit

- **Trigger:** After Phase 2 (Client Data Entry) is complete
- **Focus areas:** Security (re-check injection fixes), Test Coverage (target 70%+), Accessibility (form inputs)

---

## Re-Run Checklist

```bash
# 1. Quality gates
npx eslint src/ && npx tsc --noEmit && npx next build && npx vitest run && npm audit

# 2. Security scan
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx"
grep -rn ": any\b" src/ --include="*.ts" --include="*.tsx"
grep -rn " as [A-Z]" src/ --include="*.ts" --include="*.tsx"

# 3. Dependencies
npm audit
npx depcheck

# 4. Test coverage
npx vitest run --coverage

# 5. Bundle size (when @next/bundle-analyzer is installed)
# ANALYZE=true npx next build
```

---

*Audit based on Bas's Comprehensive Codebase Audit Template v1.0 | OWASP Top 10, WCAG 2.1 AA, Core Web Vitals*
