# Nebula — Coaching Platform

A full-stack coaching platform where coaches publish programs, open cohorts, and
follow their students, while students discover programs, enrol, and submit work.

Built with **Next.js 15** (App Router), **Prisma 7**, and **PostgreSQL**.

**Live demo:** https://nebula-test-g5k5.vercel.app

---

## Stack

| Layer     | Technology                                            |
|-----------|-------------------------------------------------------|
| Framework | Next.js 15 — App Router, Server Components, Server Actions |
| Language  | TypeScript                                            |
| Database  | PostgreSQL (Supabase-hosted)                          |
| ORM       | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Auth      | Cookie-based sessions (`nebula_sid`), persisted in the `UserSession` table |
| Styling   | Global CSS with utility classes + inline styles       |
| Icons     | Lucide React                                          |

---

## Getting Started

### Prerequisites

- **Node.js 20 or later** (required by Prisma 7)
- A PostgreSQL database — a free Supabase project works well

### 1. Install

```bash
git clone https://github.com/Eliane-237/Nebula-Test.git
cd Nebula-Test
npm install
```

`npm install` runs `prisma generate` automatically via the `postinstall` hook.

### 2. Configure the environment

Copy the example file and fill in your connection string:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/nebula?sslmode=require"
```

If you use Supabase, take the **connection string** from
*Project Settings → Database*. The app opens a `pg` `Pool` directly, so either
the direct connection or the session pooler works.

### 3. Create the schema and seed data

```bash
npx prisma migrate deploy
npx prisma db seed
```

The seed creates the three demo accounts below, a set of published programs
across all domains, open cohorts, and sample explorations.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000 — you land on the public program catalog.

### Deploying

The project deploys to Vercel with no extra configuration. Set `DATABASE_URL`
in *Project Settings → Environment Variables*, then run
`npx prisma migrate deploy` and `npx prisma db seed` once against the production
database.

---

## Demo Accounts

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Student | student@nebula.com   | `student123` |
| Coach   | coach@nebula.com     | `coach123`   |
| Admin   | admin@nebula.com     | `admin123`   |

The sign-in page includes a **quick-login panel** so you can switch roles in one
click. Credentials are stored in plain text in `loginAction.ts` — a deliberate
demo shortcut, discussed in `PRODUCT_NOTES.md`.

> Enrolment is reserved for accounts with the `student` role. Sign in as
> **student@nebula.com** to exercise the full enrolment flow.

---

## Features

### Public (no account required)

- Browse the program catalog with free-text search and domain filters
- Open any program to see its description, learning outcomes, cohorts and seats left
- Apply to become a coach through the application form

### Student

- Enrol in an open cohort from a program's detail page
- Track enrolled programs with coach, session schedule, and cohort size
- Submit written responses to explorations and read coach feedback
- Personal dashboard with upcoming sessions and progress

### Coach

- Create programs (title, domain, difficulty, session count, learning outcomes)
- Publish or archive a program
- Open cohorts with automatically scheduled session dates
- See enrolled students per cohort
- Add explorations to a program and give feedback on student responses

### Admin

- KPI dashboard: programs, active cohorts, enrolments, coach/student counts
- Live feed of recent enrolments and upcoming sessions
- Review incoming coach applications

---

## Project Structure

```
src/
├── app/
│   ├── (public)/            # Public shell: catalog, program detail
│   │   ├── layout.tsx        # Public header, session-aware
│   │   └── programs/
│   ├── (app)/               # Authenticated shell: sidebar + role pages
│   │   ├── layout.tsx        # Session guard
│   │   ├── dashboard/        # Role-aware dashboard
│   │   ├── my-programs/      # Student
│   │   ├── coach/            # Coach program & cohort management
│   │   └── admin/            # Admin KPIs
│   ├── login/               # Sign-in page (Suspense-wrapped client form)
│   └── actions/             # Server actions + query helpers
├── application/             # Use cases + repository ports
├── domain/                  # Entities, value objects, domain errors
├── infrastructure/          # Prisma implementations of the ports
├── components/              # AppShell, Sidebar, shared UI
├── lib/                     # Prisma client, session helpers, labels
└── middleware.ts            # Public/protected route routing
prisma/
├── schema.prisma            # Data model
├── migrations/              # Migration history
└── seed.ts                  # Demo data
```

---

## Architecture Notes

**Sessions.** Signing in creates a row in `UserSession` holding an opaque UUID
token, the user ID, and a 7-day expiry. The token is sent to the browser as an
`httpOnly`, `sameSite=lax` cookie named `nebula_sid`. `getSession()` resolves
the token to a user on every server render; expired rows are deleted on read.
Signing out deletes both the row and the cookie.

**Route protection is layered.** `middleware.ts` performs a cheap presence check
on the cookie and redirects anonymous traffic to `/login?redirect=<path>`. It
cannot validate the session — the token is opaque and the Edge Runtime has no
database access — so the authoritative check lives in `src/app/(app)/layout.tsx`,
which resolves the session and redirects when it is missing. Role checks live in
the individual pages.

**Prisma with a driver adapter.** `src/lib/prisma.ts` builds the client over a
`pg` `Pool` through `@prisma/adapter-pg`, and caches it on `globalThis` in
development to survive hot reloads. When `DATABASE_URL` is absent the client is
constructed without an adapter so that `next build` and type-checking succeed;
any query attempted in that state throws at runtime.

**Server/client split.** Data fetching happens in async Server Components.
Interactive pieces (`ProgramsCatalog`, `CohortList`, `LoginForm`) are `'use client'`
components that receive data as props. Mutations go through Server Actions in
`src/app/actions/`, which return a `{ ok: true } | { ok: false; error }` result
rather than throwing, so the UI can render a message inline.

**Domain layer.** `src/domain` and `src/application` hold entities, value objects
(`DateRange`, `CohortCapacity`) and use cases behind repository ports, with Prisma
implementations in `src/infrastructure`. This layer covers program and cohort
creation; simpler read paths query Prisma directly from the action layer.