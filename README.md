# Nebula — Coaching Platform

A full-stack coaching platform built with **Next.js 15**, **Prisma 7**, and **PostgreSQL** (via Supabase).

## Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Framework   | Next.js 15 (App Router, Server Components)   |
| Database    | PostgreSQL (Supabase) via `@prisma/adapter-pg` |
| ORM         | Prisma 7                                     |
| Auth        | Cookie-based session (`nebula_sid`)          |
| Styling     | CSS Modules / Global CSS                     |
| Icons       | Lucide React                                 |

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (Supabase recommended)

### Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL`:

```env
DATABASE_URL=postgresql://...
```

Run migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Accounts

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Student | student@nebula.com         | student123  |
| Coach   | coach@nebula.com           | coach123    |
| Admin   | admin@nebula.com           | admin123    |

## Features

### Student
- Explore the program catalog with search and domain filters
- Enroll in cohorts directly from a program's detail page
- Track enrolled programs with coach name, session dates, and enrollment count
- Submit exploration responses and view coach feedback

### Coach
- Create and manage programs (title, domain, difficulty, sessions, learning outcomes)
- Publish / archive programs
- Create cohorts with auto-scheduled session dates
- View enrolled students per cohort
- Add explorations to programs and provide feedback on student responses

### Admin
- Dashboard with platform KPIs (programs, cohorts, enrollments, coaches)
- Real-time feed of recent enrollments and upcoming sessions
- View all programs in the catalog

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app shell (dashboard, coach, admin)
│   ├── (public)/       # Public pages (login, program catalog)
│   └── actions/        # Server actions & DB queries
├── components/         # Shared UI components (Sidebar, AppShell)
├── lib/                # Prisma client, session helpers, user context
└── types/              # Shared TypeScript types
prisma/
├── schema.prisma       # Data model
└── seed.ts             # Seed data
```

## Architecture Notes

- **Session store**: In-memory `Map` keyed by session ID (`nebula_sid` cookie). Three hardcoded test-session IDs are pre-loaded. Real DB lookups use `user.email` from the session.
- **Prisma + pg**: Uses `@prisma/adapter-pg` (connection-based) instead of the default `pg` pooler. All server components that import Prisma use a dynamic `import('@/lib/prisma')` to prevent webpack bundling `pg`'s Node.js `fs` dependency.
- **Server / Client split**: Data fetching happens in async server components; interactive UI is extracted into `'use client'` components passed data as props.
