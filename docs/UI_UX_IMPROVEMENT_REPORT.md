# CRM App – UI/UX & Web Design Improvement Report

**Role:** Project Manager (UI/UX & Web Design focus)  
**References:** Technical Documentation (Customizable Project CRM), Project CRM Synthesis Report  
**Date:** March 5, 2026  

---

## 1. Alignment with documentation

### 1.1 Technical documentation checklist

| Requirement | Status | Notes |
|-------------|--------|--------|
| Widget-based, drag-and-drop dashboard | ⚠️ **Partial** | `react-grid-layout` and `DashboardGrid` exist; dashboard view uses a **static CSS grid** instead of the grid layout. Layout is saved but not used for rendering. |
| “Uncheck to hide” KPI visibility | ✅ Done | `DashboardPreferencesModal` with checkboxes; preferences stored in DB and Zustand. |
| Persistent collapsible sidebar | ✅ Done | `AppShell` with Deals, Contacts, Tasks, Reports; collapse/expand. |
| Kanban pipeline with drag-and-drop | ✅ Done | `PipelineKanban` with `@dnd-kit`, stage columns, deal cards. |
| Visual clarity: typography, spacing, color | ✅ Good | Plus Jakarta Sans, design tokens in `globals.css`, Tailwind. |
| Next.js, Tailwind, recharts, zustand | ✅ Done | Stack matches. |

### 1.2 Synthesis report checklist

| Requirement | Status | Notes |
|-------------|--------|--------|
| Sidebar: Deals, Contacts, Tasks, Reports | ✅ Done | Matches. |
| Widget-based grid: add, remove, rearrange | ⚠️ **Partial** | Add/remove via preferences; **rearrange (drag) not used** in main dashboard view. |
| Kanban drag-and-drop | ✅ Done | Implemented. |
| Settings panel / Dashboard preferences | ✅ Done | Modal with toggles. |
| lucide-react, Tailwind | ✅ Done | shadcn/ui and date-fns not in use; forms not using react-hook-form + zod everywhere. |

---

## 2. Findings and recommendations

### 2.1 High impact

#### A. Use the drag-and-drop grid on the dashboard (spec compliance)

- **Issue:** `DashboardGrid` and saved layout are not used; `DashboardContent` renders widgets in a fixed `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Impact:** Spec asks for a “grid system where users can add, remove, and **rearrange** KPI tiles” and “smooth drag-and-drop functionality for dashboard widgets.”
- **Recommendation:** Render the KPI/chart widgets inside `DashboardGrid` so the existing layout (from DB or default) is used and users can drag to reorder. **Implemented in code.**

#### B. Resizable widgets (optional enhancement)

- **Issue:** `DashboardGrid` uses `isResizable={false}`.
- **Recommendation:** Consider enabling resizing for chart widgets (e.g. pipeline health, revenue trend) so users can control widget size. Keep KPI cards fixed or minimally resizable if preferred.

### 2.2 Medium impact – consistency and clarity

#### C. Page structure and hierarchy

- **Current:** All main pages use the same header pattern: `border-b`, `pb-4`, `mb-6`, title + actions. Good.
- **Suggestions:**
  - Add a short subtitle or breadcrumb on key pages (e.g. Reports: “KPIs, pipeline health, revenue trend”) to match Reports.
  - Use a single `page-title` / `page-header` component to enforce spacing and responsive typography.

#### D. Empty and loading states

- **Empty dashboard:** `EmptyDashboardState` is clear (quick start, import sample data).
- **Contacts/Tasks empty:** Simple “No contacts/tasks” messages; consider adding one primary CTA (e.g. “Add contact” / “Add task”) and optional illustration or short tip.
- **Loading:** Suspense fallbacks are a single gray bar; consider skeleton blocks that mirror the actual content (e.g. card skeletons on Deals, table skeleton on Contacts).

#### E. Tables: accessibility and responsiveness

- **ContactsList:** Table has no `scope="col"` on headers; consider adding it. No sticky header on scroll.
- **RecentDealsTable:** Good use of `scope="col"`; row click opens detail (keyboard access and focus management in modal could be improved).
- **Recommendation:** Ensure table headers use `scope="col"` and that modals trap focus and return focus on close (see below).

### 2.3 Lower impact – polish

#### F. Modal UX (focus and escape)

- **DashboardPreferencesModal:** Backdrop click closes; no focus trap or “focus first focusable element” on open.
- **DealDetailView:** Similar; no explicit focus trap.
- **Recommendation:** Trap focus inside modals, move focus to first focusable element on open, restore focus on close, and ensure Escape closes the modal (and is documented in aria).

#### G. Primary button and links

- **Login:** Single primary button; consistent.
- **Dashboard:** “Customize dashboard” is secondary (border); “Add Deal” is primary. Clear.
- **Recommendation:** Keep one primary action per screen and use secondary style for “Customize dashboard” and similar.

#### H. Color and contrast

- **Primary:** Indigo (`#4f46e5`); sufficient contrast on white.
- **Stage badges:** Different colors per stage; ensure text/background contrast meets WCAG AA where used for critical info.

#### I. Mobile and responsiveness

- **Sidebar:** Collapses to icon-only; good.
- **Tables:** `overflow-x-auto` used; consider card layout or simplified columns on very small screens for Contacts/Tasks.
- **Filters:** Stack on small screens; good.

#### J. Forms and validation

- **Synthesis report suggests:** react-hook-form + zod.
- **Current:** Some forms are controlled with `useState` (e.g. login, deal form). No shared validation layer.
- **Recommendation:** Introduce react-hook-form + zod for critical forms (login, add/edit deal, add contact) for consistent validation and error messages.

---

## 3. Technical stack vs documentation

- **Frontend:** Next.js, Tailwind, react-grid-layout, recharts, zustand, lucide-react ✅  
- **Backend:** Node/Next.js API routes + Prisma (doc mentions NestJS; current choice is acceptable).  
- **Auth:** NextAuth ✅  
- **Not in use:** shadcn/ui (custom components instead), date-fns (Intl used in places), react-hook-form, zod (only in package for zod).  

---

## 4. Summary

- **Strengths:** Clear layout, collapsible sidebar, Kanban, “uncheck to hide” preferences, consistent typography and tokens, good empty state on dashboard.
- **Main gap:** Dashboard does not use the existing grid layout component for drag-and-drop; this is addressed by wiring `DashboardGrid` into `DashboardContent`.
- **Next steps (in order):**  
  1. Use drag-and-drop grid on dashboard (implemented).  
  2. Modal focus trap and Escape to close.  
  3. Optional: enable resizable widgets; add skeletons; unify form validation (react-hook-form + zod).
