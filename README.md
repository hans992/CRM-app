# CRM App

A Next.js CRM with pipeline KPIs, role-based access, and team leaderboards.

## Tech Stack

- **Next.js** (App Router) – React framework, server components, server actions
- **Prisma** – ORM and migrations (SQLite by default)
- **Tailwind CSS** – styling
- **Shadcn-style UI** – functional components with Tailwind (no shadcn dependency)
- **Recharts** – pipeline funnel chart
- **Zod** – validation for forms and server actions
- **TypeScript** – end-to-end typing

## Architecture

### KPI Engine (`/src/lib/calculations`)

All business metrics live in **`/src/lib/calculations`** so the UI stays presentational:

- **`kpi.ts`** – core metrics and formulas (see [Formula Guide](#formula-guide) below).
- **`index.ts`** – re-exports for the rest of the app.

The dashboard calls the engine once per request; in **development**, execution time is logged to the server console as `[KPI Engine] Execution time: Xms`.

### RBAC (Role-Based Access Control)

Defined in **`/src/lib/auth.ts`**:

- **ADMIN** – full access; sees all deals and team leaderboard.
- **MANAGER** – same as ADMIN for deal visibility and leaderboard.
- **SALES_REP** – sees only their own deals; no leaderboard.

Deal list and detail views respect ownership; server actions enforce access before mutating data.

### Data Loading (Avoiding N+1)

- **Deals list** – single query with `include: { owner }` only. **Notes are not** included on the main list.
- **Detail view** – when a user opens a deal, notes are loaded on demand via **`getNotesForDeal(dealId)`** in `/src/app/actions/note.ts`, so the main list query stays light.
- **Leaderboard** – one `groupBy` for Closed Won by `ownerId`, then one `findMany` for user names (no per-row user fetch).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database (migrate and seed)

```bash
npx prisma migrate dev
npm run seed
```

- **Migrate** – applies the schema (e.g. `prisma/migrations/`) to the DB.
- **Seed** – creates a default user (`demo@example.com`) and sample deals. Seed logic is shared with the “Import Sample Data” button (see `/src/lib/seed.ts` and `/src/app/actions/seed.ts`).

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses a simulated session (default user from DB); replace with NextAuth or your auth layer in production.

---

## Formula Guide

Formulas are implemented in **`/src/lib/calculations/kpi.ts`**.

### Win Rate (Conversion Rate)

- **Formula:** `(Closed Won count / total deal count) × 100`
- **Code:** `calculateConversionRate(wonDeals, totalDeals)`
- **Usage:** Shown as “conversion” on the “Deals This Month” KPI when applicable.

### Weighted Forecast

- **Idea:** Expected revenue from open pipeline by weighting each deal’s value by stage probability.
- **Formula:**  
  `Forecast = Σ (deal.value × P(stage))`  
  for all deals that are **not** Closed Won or Lost.
- **Stage probabilities** (in code):

  | Stage        | Probability |
  |-------------|-------------|
  | Prospecting | 0.1         |
  | Qualified   | 0.3         |
  | Negotiating | 0.7         |
  | Closed Won  | 1.0         |
  | Lost        | 0.0         |

- **Code:** `calculateForecast(deals)` – only open stages are summed; Closed Won / Lost are excluded.

### Velocity

- **Velocity** (e.g. sales velocity or deal velocity) is **not** implemented in this repo.
- A common form is: **Velocity = (Number of deals × Average deal value × Win rate) / Sales cycle length**.
- You can add it in `/src/lib/calculations/kpi.ts` using existing helpers: `calculateTotalValue`, `calculateConversionRate`, and deal counts/time ranges as needed.

### Trend (period-over-period)

- **Formula:** `((current − previous) / previous) × 100` (percentage change).
- **Code:** `calculateTrend(current, previous)` – used for KPI cards (e.g. vs last month).

## Project structure (high level)

```
src/
  app/
    page.tsx          # Home: auth, filters, deals query, leaderboard (admin/manager)
    actions/         # Server actions: deal, note, deal-bulk, seed
  components/
    dashboard/       # Dashboard, KPICard, EmptyDashboardState, TeamLeaderboard, etc.
  lib/
    calculations/   # KPI engine (kpi.ts, index.ts)
    auth.ts         # getCurrentUser, canAccessAllDeals, UserRole
    prisma.ts       # Prisma client singleton
    seed.ts         # Reusable seed logic (CLI + Import Sample Data)
    filters.ts      # Date/status filter helpers
prisma/
  schema.prisma     # User, Deal, Note, etc.
  seed.ts           # CLI seed (creates user + calls runSeed)
```

## Conventions

- **Functional components**; Tailwind for layout and styling.
- **KPI and formulas** live in `/lib/calculations` only.
- **Server actions** for mutations and for on-demand reads (e.g. notes for detail view).
- **Include only what you need** in Prisma queries to avoid N+1 and large payloads.
