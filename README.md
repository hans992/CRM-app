# CRM App

A Next.js CRM with customizable dashboard KPIs, pipeline (table + Kanban), contacts, tasks, reports, and role-based access.

## Tech Stack

- **Next.js** (App Router) – React framework, server components, server actions
- **NextAuth.js** (v5) – authentication (Credentials provider), session, protected routes
- **Prisma** – ORM and migrations (SQLite by default)
- **Tailwind CSS** – styling
- **Recharts** – pipeline funnel chart, revenue trend (area) chart
- **Zod** – validation for forms and server actions
- **Zustand** – client state for dashboard preferences (hydrated from server)
- **@dnd-kit** – drag-and-drop for pipeline Kanban board
- **TypeScript** – end-to-end typing

## Architecture

### Routes

- **`/`** – Deals: dashboard (table view) or Kanban (board view), filters, preferences
- **`/login`** – Sign in (email + password; credentials via NextAuth)
- **`/contacts`** – Contact list, search, add; **`/contacts/[id]`** – contact detail (360° view)
- **`/tasks`** – Task list, filters, assignee; create/edit/delete tasks
- **`/reports`** – Reports view (KPIs, pipeline health, revenue trend, leaderboard) with date/status filters

Layout: **AppShell** (collapsible sidebar + main content) wraps all dashboard routes; auth middleware protects `/`, `/contacts`, `/tasks`, `/reports`.

### KPI Engine (`/src/lib/calculations`)

Business metrics live in **`/src/lib/calculations`** so the UI stays presentational:

- **`kpi.ts`** – core metrics and formulas (see [Formula Guide](#formula-guide) below)
- **`index.ts`** – re-exports

The dashboard and reports pages call the engine once per request.

### RBAC (Role-Based Access Control)

Defined in **`/src/lib/auth.ts`**:

- **ADMIN** – full access; sees all deals, team leaderboard, reports
- **MANAGER** – same as ADMIN for deal visibility and leaderboard
- **SALES_REP** – sees only their own deals; no leaderboard

Deal list, filters, and server actions enforce ownership and access.

### Data Loading

- **Deals list** – single query with `include: { owner }`. Notes loaded on demand in deal detail via **`getNotesForDeal(dealId)`** in `/src/app/actions/note.ts`.
- **Leaderboard** – one `groupBy` for Closed Won by `ownerId`, then one `findMany` for user names.
- **Contacts / Tasks** – server actions in `/src/app/actions/contact.ts` and `/src/app/actions/task.ts`; Prisma models `Contact`, `Company`, `Task`.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

- **`DATABASE_URL`** – Prisma connection (default `file:./dev.db` for SQLite)
- **`AUTH_SECRET`** – required for NextAuth in production; generate with `openssl rand -base64 32`
- **`DEMO_PASSWORD`** (optional) – in production, credentials login can require this password

### 3. Database (migrate and seed)

```bash
npx prisma migrate dev
npx prisma db seed
```

- **Migrate** – applies the schema to the DB.
- **Seed** – creates users (`demo@example.com`, plus Admin/Manager/Sales reps) and sample deals. Seed logic is shared with the “Import Sample Data” action (`/src/lib/seed.ts`, `/src/app/actions/seed.ts`).

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` (e.g. `demo@example.com` with your password; if no password is enforced locally, any non-empty password may work after seed). After login you can use Deals (table/board), Contacts, Tasks, and Reports.

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

### Trend (period-over-period)

- **Formula:** `((current − previous) / previous) × 100` (percentage change).
- **Code:** `calculateTrend(current, previous)` – used for KPI cards (e.g. vs last month).

## Project structure (high level)

```
src/
  app/
    (dashboard)/           # Protected routes: layout (AppShell), page (Deals), contacts, tasks, reports
      page.tsx             # Deals: table or Kanban, dashboard widgets, filters
      layout.tsx           # getCurrentUser, AppShell
      contacts/            # List, search, add; [id] detail
      tasks/               # List, filters, add
      reports/             # ReportsView, ReportsFilters
    login/
      page.tsx             # Sign-in form (NextAuth credentials)
    api/auth/[...nextauth]/  # NextAuth route handlers
    actions/               # Server actions: auth, deal, note, deal-bulk, seed, contact, task, preferences
    layout.tsx
  components/
    dashboard/             # Dashboard, DashboardContent, KPICard, PipelineKanban, etc.
    layout/
      AppShell.tsx         # Sidebar (Deals, Contacts, Tasks, Reports), user menu
  lib/
    calculations/         # KPI engine (kpi.ts, index.ts)
    auth.ts               # getCurrentUser, canAccessAllDeals, UserRole
    prisma.ts             # Prisma client singleton
    seed.ts               # Reusable seed logic (CLI + Import Sample Data)
    filters.ts            # Date/status filter helpers
prisma/
  schema.prisma            # User, Contact, Company, Deal, Note, Task, Activity
  seed.ts                 # CLI seed (users + runSeed)
```

## Conventions

- **Functional components**; Tailwind for layout and styling.
- **KPI and formulas** live in `/lib/calculations` only.
- **Server actions** for mutations and for on-demand reads (e.g. notes for deal detail).
- **NextAuth** for auth; middleware protects dashboard routes; RBAC in `getCurrentUser` and server logic.
- **Include only what you need** in Prisma queries to avoid N+1 and large payloads.
