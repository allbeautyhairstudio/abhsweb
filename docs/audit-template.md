# Bas's Comprehensive Codebase Audit Template

> **Generic, reusable template for a full-stack web project audit.**
> Adapt sections to your stack. Delete what doesn't apply. Add what's missing.
> Run before major releases, after large feature merges, or on a regular cadence.

---

## How to Use This Template

1. Copy this file into your project
2. Replace `{PLACEHOLDER}` values with your project specifics
3. Work through each section top-to-bottom
4. Record findings in the Issues Tracker (Section 13)
5. Fix issues by severity: CRITICAL → HIGH → MEDIUM → LOW
6. Re-run quality gates after all fixes
7. Update the Health Dashboard (Section 1) with final scores

---

## 1. Health Dashboard

> Fill this in AFTER completing all sections. Score each dimension 1-10.

| Dimension           | Score   | Grade | Notes                  |
| ------------------- | ------- | ----- | ---------------------- |
| Quality Gates       | /5      |       |                        |
| Code Quality        | /10     |       |                        |
| Security            | /10     |       |                        |
| Accessibility       | /10     |       |                        |
| Performance         | /10     |       |                        |
| i18n                | /10     |       | N/A if single-language |
| Test Coverage       | /10     |       |                        |
| Tech Debt           | /10     |       |                        |
| Dependencies        | /10     |       |                        |
| Documentation       | /10     |       |                        |
| File Organization   | /10     |       |                        |
| **Overall**         | **/10** |       |                        |

**Grading:** A+ = 10, A = 9, B+ = 8, B = 7, C = 6, D = 5, F = <5

---

## 2. Quality Gates

Run each command. Record pass/fail and any output worth noting.

| Gate       | Command                        | Status | Notes |
| ---------- | ------------------------------ | ------ | ----- |
| Lint       | `{package_manager} lint`       |        |       |
| Type Check | `{package_manager} type-check` |        |       |
| Build      | `{package_manager} build`      |        |       |
| Unit Tests | `{package_manager} test`       |        |       |
| Dep Audit  | `{package_manager} audit`      |        |       |

**All 5 must pass before shipping.** If audit shows vulnerabilities, classify as production vs dev-only.

---

## 3. Codebase Metrics

> Establish a baseline. Compare against future audits to track trajectory.

| Metric                          | Value |
| ------------------------------- | ----- |
| Source files (.ts/.tsx/.js/.jsx) |       |
| Lines of code (approx)         |       |
| Components (total)              |       |
| Pages/routes                    |       |
| API routes/endpoints            |       |
| Custom hooks                    |       |
| Type definition files           |       |
| Utility/helper files            |       |
| Production dependencies         |       |
| Dev dependencies                |       |
| Test files                      |       |
| Test cases (total)              |       |

---

## 4. Security Audit

### 4.1 Secrets & Credentials

Search the entire codebase for leaked secrets.

**Search patterns:**
```
- API keys, tokens, passwords hardcoded in source
- .env files committed to git (check git history too)
- Secrets in client-side code (browser-accessible)
- Private keys in repository
```

**Commands:**
```bash
# Check git history for secrets
git log --all -p | grep -i "password\|secret\|api_key\|token\|private_key" | head -50

# Check for committed .env files
git ls-files | grep -i "\.env"

# Search source for hardcoded secrets
grep -r "sk_live\|sk_test\|AKIA\|password\s*=" src/
```

| Check                                     | Status | Notes |
| ----------------------------------------- | ------ | ----- |
| No secrets in source code                 |        |       |
| No .env files in git                      |        |       |
| .env.example has names only (no values)   |        |       |
| Server-only secrets not exposed to client |        |       |
| Git history clean of secrets              |        |       |

### 4.2 Injection Prevention

| Check                                             | Status | Notes |
| ------------------------------------------------- | ------ | ----- |
| All user input validated server-side              |        |       |
| Parameterized queries (no string concatenation)   |        |       |
| No `dangerouslySetInnerHTML` without sanitization |        |       |
| No `eval()` or `Function()` with user input       |        |       |
| No raw SQL queries                                |        |       |

### 4.3 Authentication & Authorization

| Check                                                  | Status | Notes |
| ------------------------------------------------------ | ------ | ----- |
| Protected routes require authentication                |        |       |
| Session tokens in httpOnly cookies (not localStorage)  |        |       |
| Session timeout configured                             |        |       |
| Login rate limiting                                    |        |       |
| RBAC/permissions enforced server-side                  |        |       |
| Auth state verified server-side (not just client)      |        |       |

### 4.4 CSRF & Request Integrity

| Check                                                   | Status | Notes |
| ------------------------------------------------------- | ------ | ----- |
| CSRF tokens or Origin header verification               |        |       |
| State-changing operations use POST/PUT/DELETE (not GET)  |        |       |
| API routes validate request origin                      |        |       |

### 4.5 Security Headers

| Header                      | Expected Value                  | Actual | Status |
| --------------------------- | ------------------------------- | ------ | ------ |
| Content-Security-Policy     | Restrictive policy              |        |        |
| X-Frame-Options             | DENY or SAMEORIGIN              |        |        |
| X-Content-Type-Options      | nosniff                         |        |        |
| Referrer-Policy             | strict-origin-when-cross-origin |        |        |
| Permissions-Policy          | Restrictive                     |        |        |
| Strict-Transport-Security   | max-age=31536000                |        |        |

### 4.6 PII & Data Privacy

| Check                                            | Status | Notes |
| ------------------------------------------------ | ------ | ----- |
| No PII in logs (names, emails, phone numbers)    |        |       |
| No PII in error messages returned to client      |        |       |
| Data retention policy implemented                |        |       |
| Data deletion capability exists (GDPR/CCPA)      |        |       |
| Minimal data collection (only what's needed)     |        |       |
| Children's data protected (if applicable, COPPA) |        |       |

**Search for PII logging:**
```bash
# Find console.log/warn/error that might log PII
grep -rn "console\.\(log\|warn\|error\)" src/ --include="*.ts" --include="*.tsx"
```

### 4.7 Error Handling

| Check                                       | Status | Notes |
| ------------------------------------------- | ------ | ----- |
| No stack traces exposed to users            |        |       |
| No internal paths exposed in error messages |        |       |
| No database error details exposed           |        |       |
| Generic error messages on client            |        |       |
| Errors logged server-side for debugging     |        |       |

### 4.8 Rate Limiting

| Endpoint/Action  | Limit   | Implemented | Notes |
| ---------------- | ------- | ----------- | ----- |
| Login attempts   | /min/IP |             |       |
| Form submissions | /hr/IP  |             |       |
| API endpoints    | /min/IP |             |       |
| File uploads     | /hr/IP  |             |       |

---

## 5. Code Quality Audit

### 5.1 Type Safety

**Search patterns:**
```bash
# Find `any` types
grep -rn ": any\b\|as any\b\|<any>" src/ --include="*.ts" --include="*.tsx"

# Find non-null assertions
grep -rn "[a-zA-Z]!" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# Find type assertions (as)
grep -rn " as [A-Z]" src/ --include="*.ts" --include="*.tsx"
```

| Check                              | Status | Count | Notes |
| ---------------------------------- | ------ | ----- | ----- |
| No `any` types                     |        |       |       |
| No `!` non-null assertions         |        |       |       |
| No unsafe `as` type assertions     |        |       |       |
| Return types on exported functions |        |       |       |
| Strict mode enabled                |        |       |       |

### 5.2 Code Patterns

| Check                                        | Status | Notes |
| -------------------------------------------- | ------ | ----- |
| Consistent naming conventions                |        |       |
| One component per file                       |        |       |
| Consistent import ordering                   |        |       |
| No unused imports/variables                  |        |       |
| No dead code / commented-out code            |        |       |
| No TODO/FIXME/HACK without issue links       |        |       |
| No duplicate logic that should be shared     |        |       |
| Error boundaries for critical sections       |        |       |

### 5.3 Lint & Format

| Check                                         | Status | Notes |
| --------------------------------------------- | ------ | ----- |
| Zero lint errors                              |        |       |
| Zero lint warnings                            |        |       |
| No `eslint-disable` without justification     |        |       |
| Consistent formatting (Prettier/dprint)       |        |       |

---

## 6. Accessibility Audit (WCAG 2.1 AA)

### 6.1 Automated Checks

Run axe-core or Lighthouse accessibility on every page.

```bash
# If you have Playwright + axe-core
npx playwright test tests/accessibility/

# If using Lighthouse CLI
npx lighthouse {URL} --only-categories=accessibility --output=json
```

### 6.2 Manual Checklist

| Requirement                                            | Status | Notes |
| ------------------------------------------------------ | ------ | ----- |
| Skip-to-content link on every page                     |        |       |
| All images have appropriate alt text                   |        |       |
| Color contrast 4.5:1 minimum (text)                   |        |       |
| Color contrast 3:1 minimum (large text, UI)            |        |       |
| All interactive elements keyboard-accessible           |        |       |
| Visible focus indicators on all focusable elements     |        |       |
| Semantic HTML (`<button>`, `<a>`, `<nav>`, `<main>`)   |        |       |
| ARIA used only as supplement (not replacement)         |        |       |
| Every form input has a linked `<label>`                |        |       |
| Related inputs grouped in `<fieldset>` + `<legend>`    |        |       |
| Error messages linked via `aria-describedby`           |        |       |
| `aria-live` regions for dynamic content                |        |       |
| `prefers-reduced-motion` respected                     |        |       |
| Touch targets 44x44px minimum (mobile)                 |        |       |
| Content readable at 200% zoom (no h-scroll)            |        |       |
| Heading hierarchy (h1 → h2 → h3, no skips)            |        |       |
| Decorative images/icons have `aria-hidden="true"`      |        |       |
| Page titles are unique and descriptive                 |        |       |
| Language attribute set on `<html>`                     |        |       |

---

## 7. Performance Audit

### 7.1 Core Web Vitals

Measure with Lighthouse or PageSpeed Insights on key pages (home, most-trafficked, most complex).

| Metric                    | Target  | Home | Key Page 2 | Key Page 3 |
| ------------------------- | ------- | ---- | ---------- | ---------- |
| LCP                       | < 2.5s  |      |            |            |
| FCP                       | < 1.8s  |      |            |            |
| FID/INP                   | < 200ms |      |            |            |
| CLS                       | < 0.1   |      |            |            |
| Lighthouse Performance    | 90+     |      |            |            |
| Lighthouse Accessibility  | 100     |      |            |            |
| Lighthouse Best Practices | 90+     |      |            |            |
| Lighthouse SEO            | 90+     |      |            |            |

### 7.2 Asset Optimization

| Check                                               | Status | Notes |
| --------------------------------------------------- | ------ | ----- |
| Images optimized (WebP/AVIF, responsive sizes)      |        |       |
| No raw `<img>` tags (use framework Image component) |        |       |
| Fonts loaded optimally (no layout shift)            |        |       |
| Font subsetting (Latin-only if applicable)          |        |       |
| Lazy loading for below-fold content                 |        |       |
| Hero/above-fold images prioritized                  |        |       |

### 7.3 JavaScript & Bundle

| Check                                                  | Status | Notes |
| ------------------------------------------------------ | ------ | ----- |
| Server components by default (if React/Next.js)        |        |       |
| Dynamic imports for heavy components                   |        |       |
| Tree-shaken imports (named, not wildcard)              |        |       |
| No packages >50KB gzipped without justification        |        |       |
| No duplicate functionality (e.g., moment + date-fns)   |        |       |
| Bundle analyzer run, no surprises                      |        |       |

### 7.4 Data Fetching & Caching

| Check                                          | Status | Notes |
| ---------------------------------------------- | ------ | ----- |
| Server-side fetching where possible            |        |       |
| Appropriate Cache-Control headers              |        |       |
| External API responses cached                  |        |       |
| API timeouts configured (no hanging requests)  |        |       |
| No unbounded database queries (pagination)     |        |       |
| Specific column selection (no SELECT *)        |        |       |

---

## 8. i18n Audit

> Skip this section if your project is single-language.

| Check                                                | Status | Notes |
| ---------------------------------------------------- | ------ | ----- |
| All user-visible strings in translation files        |        |       |
| No hardcoded strings in components                   |        |       |
| Translation file parity (same keys in all locales)   |        |       |
| Locale-aware date/time formatting                    |        |       |
| Locale-aware number formatting                       |        |       |
| Locale-aware currency formatting                     |        |       |
| Units of measurement translatable                    |        |       |
| URL structure supports locales                       |        |       |
| Language switcher works correctly                    |        |       |
| RTL support (if applicable)                          |        |       |

**Find hardcoded strings:**
```bash
# Search for English text in JSX (adjust regex for your patterns)
grep -rn '>[A-Z][a-z]' src/ --include="*.tsx" | grep -v "node_modules\|\.test\."
```

---

## 9. Test Coverage Audit

### 9.1 Coverage Report

```bash
# Generate coverage report
{package_manager} test -- --coverage
```

| Category                   | Target | Actual | Status |
| -------------------------- | ------ | ------ | ------ |
| Validation/schemas         | 100%   |        |        |
| Utility functions          | 90%    |        |        |
| API clients                | 80%    |        |        |
| Hooks/state logic          | 80%    |        |        |
| Server actions/API routes  | 80%    |        |        |
| Components (critical paths)| 70%    |        |        |
| Overall                    | 70%    |        |        |

### 9.2 Test Types Present

| Test Type                      | Files | Cases | Status |
| ------------------------------ | ----- | ----- | ------ |
| Unit tests                     |       |       |        |
| Integration tests              |       |       |        |
| E2E tests                      |       |       |        |
| Accessibility tests (axe-core) |       |       |        |
| Visual regression tests        |       |       |        |

### 9.3 Critical Paths Tested

| User Flow                            | Unit | E2E | Notes |
| ------------------------------------ | ---- | --- | ----- |
| {Critical flow 1, e.g., signup}      |      |     |       |
| {Critical flow 2, e.g., checkout}    |      |     |       |
| {Critical flow 3, e.g., login}       |      |     |       |
| Navigation (desktop + mobile)        |      |     |       |
| Error states & recovery              |      |     |       |

---

## 10. Dependency Audit

### 10.1 Vulnerability Scan

```bash
{package_manager} audit
```

| Severity | Count | Production | Dev-Only | Notes |
| -------- | ----- | ---------- | -------- | ----- |
| Critical |       |            |          |       |
| High     |       |            |          |       |
| Moderate |       |            |          |       |
| Low      |       |            |          |       |

### 10.2 Dependency Health

| Check                                    | Status | Notes |
| ---------------------------------------- | ------ | ----- |
| No unused dependencies                   |        |       |
| No missing dependencies                  |        |       |
| No duplicate functionality packages      |        |       |
| No deprecated packages                   |        |       |
| Major versions pinned                    |        |       |
| Lock file committed                      |        |       |
| No packages with <1000 weekly downloads  |        |       |

**Find unused dependencies:**
```bash
# Use depcheck or similar
npx depcheck
```

---

## 11. Tech Debt Register

> List known shortcuts, workarounds, incomplete features, and deferred work.

| Item | Type           | Impact   | Effort  | Phase/Sprint |
| ---- | -------------- | -------- | ------- | ------------ |
|      |                |          |         |              |
|      |                |          |         |              |
|      |                |          |         |              |

**Types:** Incomplete, Workaround, Performance gap, Testing gap, Design debt, Migration needed
**Impact:** Critical, High, Medium, Low, Tiny
**Effort:** Large (>1 week), Medium (2-5 days), Small (1 day), Tiny (<1 hour)

---

## 12. File Organization & Documentation

### 12.1 File Organization

| Check                                            | Status | Notes |
| ------------------------------------------------ | ------ | ----- |
| Consistent directory structure                   |        |       |
| Naming conventions followed                      |        |       |
| No orphaned/unused files                         |        |       |
| No oversized files (>500 lines)                  |        |       |
| Config files at project root                     |        |       |
| .gitignore covers all generated/sensitive files  |        |       |
| No duplicate files                               |        |       |

### 12.2 Documentation

| Document                      | Exists | Current | Notes |
| ----------------------------- | ------ | ------- | ----- |
| README.md                     |        |         |       |
| Contributing guide            |        |         |       |
| API documentation             |        |         |       |
| Architecture decisions (ADRs) |        |         |       |
| Environment setup guide       |        |         |       |
| Deployment guide              |        |         |       |

---

## 13. Issues Tracker

### How to Classify

| Severity | Definition                                        | SLA                     |
| -------- | ------------------------------------------------- | ----------------------- |
| CRITICAL | Security vulnerability, data loss risk, app crash | Fix immediately         |
| HIGH     | Broken functionality, significant UX degradation  | Fix before next release |
| MEDIUM   | Standards violation, moderate UX issue             | Fix within 2 sprints    |
| LOW      | Minor polish, code cleanliness                    | Fix when convenient     |

### Found Issues

| ID | Severity | Category | Issue | Location | Effort |
| -- | -------- | -------- | ----- | -------- | ------ |
| 1  |          |          |       |          |        |
| 2  |          |          |       |          |        |
| 3  |          |          |       |          |        |

### Fixed Issues (This Audit)

| ID | Severity | Issue | Resolution |
| -- | -------- | ----- | ---------- |
|    |          |       |            |

### Deferred Issues

| ID | Severity | Issue | Deferred To | Reason |
| -- | -------- | ----- | ----------- | ------ |
|    |          |       |             |        |

---

## 14. Audit Summary

**Date:** {YYYY-MM-DD}
**Auditor:** {name}
**Codebase:** {project name}
**Commit:** {git SHA}

### Key Findings
1.
2.
3.

### Critical Actions Required
1.
2.

### Recommendations
1.
2.
3.

### Next Audit
- **Trigger:** {before next release / after Phase X / in N weeks}
- **Focus areas:** {sections that scored lowest}

---

## Re-Run Checklist

Quick reference for re-running this audit:

```bash
# 1. Quality gates
{pm} lint && {pm} type-check && {pm} build && {pm} test && {pm} audit

# 2. Security scan
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx"
grep -rn ": any\b" src/ --include="*.ts" --include="*.tsx"
grep -rn " as [A-Z]" src/ --include="*.ts" --include="*.tsx"

# 3. Accessibility
# Run Lighthouse on all pages, run axe-core E2E tests

# 4. i18n (if applicable)
# Compare translation key counts across locales

# 5. Dependencies
{pm} audit
npx depcheck

# 6. Test coverage
{pm} test -- --coverage

# 7. Bundle size
# Run your bundle analyzer
```

---

*Template version: 1.0 | Based on OWASP Top 10, WCAG 2.1 AA, Core Web Vitals*
