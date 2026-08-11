# Product Notes — Nebula Coaching Platform

This document covers the implementation decisions, the trade-offs I accepted, and
what I would do with more time. It is written for a reader who will open the
code: every claim below reflects the actual state of the repository.

---

## 1. Implementation Decisions

### Authentication and sessions

I chose not to pull in an auth library (NextAuth, Lucia) for a project this size,
and instead wrote a minimal system that is nonetheless correct in its fundamentals.

**What is in place**

- On sign-in, `sessionStore.create()` inserts a row into `UserSession`: an opaque
  UUID token, the `userId`, and an `expiresAt` set 7 days out. Sessions therefore
  survive a server restart and horizontal scaling — which matters on Vercel,
  where consecutive requests may land on different instances.
- The token is sent as an `httpOnly`, `sameSite=lax` cookie, `secure` in
  production. It is unreachable from page JavaScript, which removes session theft
  via XSS.
- Signing out deletes the database row **and** the cookie: real revocation, not
  just a client-side clear.
- Expired sessions are deleted on read in `sessionStore.get()`.

**What is deliberately simplified**

- **Passwords are not hashed.** The three demo accounts are checked against a
  plain-text `CREDENTIALS` object in `loginAction.ts`. There is no public sign-up,
  and these credentials are printed on the sign-in page — hashing them would
  protect nothing and add noise. In production this map is replaced by a
  `passwordHash` column using `bcrypt` (cost ≥ 12) or `argon2id`.
- **No explicit CSRF token.** Next.js Server Actions verify the request origin,
  which covers the standard case. A dedicated token would be added before going
  live.

### Route protection: two layers, two distinct jobs

This is the architectural point that most deserves explanation.

`middleware.ts` runs in the Edge Runtime, which has no database access. Since the
cookie carries only an opaque UUID, **the middleware cannot know whether a session
is valid, nor what role the user holds**. It therefore does one thing: check that
the cookie is present and redirect anonymous traffic to `/login?redirect=<path>`.
That is an ergonomic filter, not a security boundary.

The authoritative check lives in `src/app/(app)/layout.tsx`, which calls
`getSession()` — hitting the database — and redirects when the session is missing
or expired. Role checks live in the individual pages (`/admin`, `/coach/*`).

The alternative was to sign a JWT carrying the role, verifiable in the middleware
with `jose`. I did not take it: it prevents immediate session revocation, and the
latency saving does not justify that here.

### Public / authenticated split

Two Next.js route groups, each with its own layout:

- `(public)` — light header with the catalog and Sign in / Sign out, usable
  without an account. The layout calls `getSession()` to adapt what it shows.
- `(app)` — application shell with sidebar, behind the session guard.

The catalog and program detail pages are **public by design**: a visitor should be
able to judge the offering before creating an account. The cohort enrolment button
is visible to everyone and redirects to sign-in while preserving the destination.

### Route structure

```
/                                → redirects to /programs
/programs                        → public catalog (search + domain filters)
/programs/[id]                   → program detail + cohort enrolment
/login                           → sign-in (+ demo quick-login)
/dashboard                       → role-aware dashboard
/my-programs                     → student: enrolled programs + explorations
/coach/programs                  → coach: own program list
/coach/programs/new              → create a program
/coach/programs/[id]             → detail: cohorts + explorations
/coach/programs/[id]/edit        → edit a program
/coach/programs/[id]/cohort/new  → create a cohort
/coach/cohorts/[id]              → manage cohort: sessions + enrolled students
/admin                           → KPI dashboard
```

### Domain layer

`src/domain` and `src/application` isolate business rules from technical detail:
`Program`, `Cohort` and `Enrollment` entities, `DateRange` and `CohortCapacity`
value objects, and use cases behind repository ports implemented by Prisma in
`src/infrastructure`.

This split covers program and cohort creation — where the rules are real
(consistent dates, valid capacity, automatic session generation). Simple reads
query Prisma directly from the action layer. Routing every `SELECT` through a port
would have added ceremony without benefit at this scale. That is an accepted
trade-off, not an oversight.

### Data integrity

- Cascading deletes: removing a `Program` removes its `Cohort`, `Session` and
  `Exploration` rows.
- Enrolment is refused when a cohort is full (`maxParticipants`), and the cohort
  flips to `FULL` automatically once capacity is reached.
- Duplicates are blocked by `@@unique([cohortId, userId])` on `Enrollment` and
  `@@unique([explorationId, userId])` on `ExplorationResponse` — enforced in the
  database, not only in application code.
- Server actions return `{ ok: false, error }` rather than throwing, so the UI can
  render errors inline.

---

## 2. Known Limitations

**Identified technical debt**

- **Dead Supabase code.** `src/lib/supabase.ts`, `supabase-server.ts`,
  `auth-context.tsx` and `use-profile-role.ts` are left over from an initial
  Supabase Auth approach that was dropped in favour of the in-house sessions.
  Nothing imports them any more; they should be deleted along with the
  `@supabase/supabase-js` dependency.
- **Inconsistent Prisma imports.** Most modules import `@/lib/prisma` statically,
  a few still use a dynamic `import()` inherited from a bundling workaround that
  is no longer needed. Worth unifying.
- **Inline styles.** Many `style={{ fontSize: 13 }}` declarations sit alongside
  global classes. Tailwind is installed but barely used. See §3.2.

**Out of scope**

- No email notifications (enrolment confirmation, session reminders, coach
  feedback).
- No file uploads: exploration responses are text only.
- No pagination: program and student lists load in full. Cursor-based pagination
  would be needed beyond a few hundred rows.
- No dedicated admin view for cohort management; admins go through the catalog.
- No automated tests. On this scope I would start with unit tests on the value
  objects and use cases — that is where the logic is dense and the cost of testing
  is lowest.

---

## 3. Given More Time

### 3.1 Harden authentication, per role

**For everyone**
- `bcrypt` (cost ≥ 12) or `argon2id` hashing, with public sign-up and email
  verification.
- Session token rotation on privilege elevation.
- Explicit CSRF token on mutating actions.
- Rate limiting on `/login` (per IP and per email) against credential stuffing.

**For coaches**
- Invitation flow: an admin invites, a single-use token (`CoachInvite`, 48h TTL)
  lets the coach set their password. The `CoachApplication` model already exists
  and would serve as the entry point.
- Optionally Google Workspace OAuth for organisations that already manage
  identity on the employer side.

**For admins**
- Mandatory MFA (TOTP or passkey): a compromised admin account exposes every
  record on the platform.
- An `AuditLog` table recording each admin action — timestamp, `userId`, payload.
- A `superadmin` / `admin` split if the platform goes multi-tenant.

### 3.2 Design in Figma before building the UI

The frontend was written straight into code. That is efficient for a prototype,
but it produces visual inconsistency and makes every change expensive.

**Approach for a V2**

1. **Design tokens first** — colours, typography, spacing and radii defined as
   Figma variables, then exported as CSS custom properties or a Tailwind config.
   A single source of truth.
2. **Figma components before React components** — program card, status badge,
   cohort table, form fields, in desktop and mobile, approved before being coded.
3. **Figma Code Connect** — link each Figma component to its React counterpart so
   developers see exactly which component and props to use.
4. **Hand off the states** — mockups must cover hover, loading, empty and error.
   Those are precisely the states sacrificed under rapid prototyping.

**Concrete visual priorities**

- Mobile responsiveness: the `(app)` sidebar has no small-screen treatment.
- Empty states: "No programs" and "No enrolled students" show generic copy where
  they should point to the next action.
- Async feedback: the Publish / Archive buttons have no loading state.
- A formal type scale, to replace the inline font sizes.

### 3.3 Other work

- **Observability** — structured logging and error tracking (Sentry); errors
  currently go to `console.error`.
- **Concurrency** — two simultaneous enrolments for the last seat both pass the
  application-level check. A transaction with row locking, or a capacity
  constraint in the database, would close that window.
- **Internationalisation** — the interface mixes English and French. Pick one,
  then extract the strings.

---

## 4. Verified End-to-End Flows

| Flow | Status |
|------|--------|
| Catalog discovery and filters (signed-out visitor) | ✅ |
| Student enrolment in a cohort | ✅ |
| Enrolment blocked: full cohort, duplicate, non-student role | ✅ |
| My Programs with coach and session details | ✅ |
| Exploration response submission | ✅ |
| Student dashboard on real data | ✅ |
| Coach program creation and publishing | ✅ |
| Cohort creation with automatic session scheduling | ✅ |
| Cohort management: sessions and enrolled students | ✅ |
| Exploration creation and coach feedback | ✅ |
| Coach dashboard on real statistics | ✅ |
| Admin KPI dashboard | ✅ |
| Sign-in, post-login redirect to the original destination, sign-out | ✅ |