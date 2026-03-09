# AI Marketing Reset — Operations Dashboard

A local operations dashboard for managing the AI Marketing Reset service. Built for Karli Rosario to run her one-time marketing diagnostic + system build service for solopreneurs.

## What It Does

- **Client Management** — Full intake form (48 questions), client list with search, detailed client profiles
- **Auto-Population** — Enter intake data once, 38 prompt templates auto-fill with client info
- **Pipeline Tracking** — 10-stage Kanban board from Inquiry to Follow-Up Complete
- **Session Prep** — Pre-session summary with scoring, flags, talking points, and checklist
- **Deliverables** — Track 9 deliverable types with RAI review gates
- **Metrics** — Revenue, pipeline funnel, conversion rates, referral tracking
- **Fit Assessment** — Scoring engine with archetype detection and accept/decline flows

## Quick Start

### First Time Setup

Double-click `setup.bat` — installs dependencies and builds the project.

### Daily Use

Double-click `start-dashboard.bat` — starts the server and opens the dashboard in Edge at `http://localhost:3000`.

### Manual Start

```bash
npm install
npm run dev
```

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 16 (App Router)           |
| Language    | TypeScript (strict mode)          |
| Database    | SQLite (better-sqlite3)           |
| Styling     | Tailwind CSS 4 + shadcn/ui        |
| Validation  | Zod                               |
| Testing     | Vitest (unit) + Playwright (E2E)  |

## Testing

```bash
# Unit tests (295 tests, ~1 second)
npx vitest run

# E2E tests (14 tests, ~15 seconds)
npm run test:e2e

# E2E with browser visible
npm run test:e2e:headed
```

## Project Structure

```text
src/
  app/          — Pages (Next.js App Router)
  components/   — Reusable UI components
  lib/          — Database, queries, validation, scoring
    constants/  — Pipeline stages, prompt templates, field mappings
    queries/    — Client, deliverable, metrics, notes, prompts CRUD
```

## Security

- Zod validation on all API routes
- Input sanitization (XSS prevention)
- SQL column allowlist (injection prevention)
- CSP + security headers
- All data stored locally — no external API calls

## Data

All client data lives in `src/data/dashboard.db` (SQLite). Automatic rolling 7-day backups in `src/data/backups/`. Database files are git-ignored.
