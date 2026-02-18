# CRM App

A Next.js CRM application with Tailwind CSS, TypeScript, and Prisma.

## Structure

- **`/src/components/dashboard`** – Dashboard UI components (functional, Tailwind-styled)
- **`/src/lib/calculations`** – All KPI and business logic (keeps UI clean)
- **`/src/types`** – Shared TypeScript definitions

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Conventions

- Functional components only
- Tailwind CSS for styling
- KPI calculations in `/lib/calculations` – never in components
- Prisma for database access
