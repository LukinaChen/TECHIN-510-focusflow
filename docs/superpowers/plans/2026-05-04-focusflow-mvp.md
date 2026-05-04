# FocusFlow MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement auth, layout, timer UI, focus detection, and DB persistence for the FocusFlow app (Issues #2, #3, #4, #5, #8).

**Architecture:** Next.js 14 App Router with a `(authenticated)` route group for protected pages, `@supabase/ssr` for cookie-based auth in middleware and server components, and a single client-side timer page that drives the countdown + focus detection + DB save.

**Tech Stack:** Next.js 14, Tailwind CSS, Supabase (Auth + Postgres), `@supabase/ssr`

---

### File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `supabase/migrations/001_sessions.sql` | Sessions table DDL |
| Install | `@supabase/ssr` | SSR-safe Supabase clients |
| Create | `lib/supabase/client.ts` | Browser Supabase client |
| Create | `lib/supabase/server.ts` | Server Supabase client |
| Create | `middleware.ts` | Auth route guard |
| Modify | `app/layout.tsx` | Update metadata |
| Modify | `app/page.tsx` | Redirect based on auth |
| Create | `app/login/page.tsx` | Login form |
| Create | `app/signup/page.tsx` | Signup form |
| Create | `app/(authenticated)/layout.tsx` | NavBar wrapper layout |
| Create | `components/NavBar.tsx` | Nav with active links + logout |
| Create | `app/(authenticated)/timer/page.tsx` | Timer + focus detection + DB save |
| Create | `app/(authenticated)/dashboard/page.tsx` | Session history + points |

---

### Task 1: Supabase migration + client utilities

**Files:**
- Create: `supabase/migrations/001_sessions.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] Install `@supabase/ssr`
- [ ] Create `supabase/migrations/001_sessions.sql` with the sessions DDL
- [ ] Create `lib/supabase/client.ts` using `createBrowserClient`
- [ ] Create `lib/supabase/server.ts` using `createServerClient` + Next.js cookies
- [ ] Commit

---

### Task 2: Middleware auth guard (Issue #2 partial)

**Files:**
- Create: `middleware.ts`

- [ ] Create `middleware.ts`: unauthenticated → `/login`, authenticated on auth routes → `/timer`
- [ ] Commit

---

### Task 3: Auth pages — Login + Signup (Issue #2)

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/signup/page.tsx`
- Modify: `app/page.tsx`

- [ ] Create login page: email/password form, error display, link to signup, redirect to `/timer` on success
- [ ] Create signup page: email/password form, error display, link to login, redirect to `/timer` on success
- [ ] Update root `app/page.tsx` to redirect to `/timer` if authed else `/login`
- [ ] Update `app/layout.tsx` metadata (title: "FocusFlow")
- [ ] Commit

---

### Task 4: NavBar + authenticated layout (Issue #8)

**Files:**
- Create: `components/NavBar.tsx`
- Create: `app/(authenticated)/layout.tsx`

- [ ] Create `NavBar.tsx`: FocusFlow branding, Timer/Dashboard links with active highlighting via `usePathname`, Logout button
- [ ] Create `app/(authenticated)/layout.tsx`: renders NavBar above children
- [ ] Commit

---

### Task 5: Timer page — countdown + focus detection + DB save (Issues #3, #4, #5)

**Files:**
- Create: `app/(authenticated)/timer/page.tsx`

- [ ] Build state machine: `idle | running | completed | broken | cancelled`
- [ ] Idle state: preset buttons (25/50 min), custom input (1–120), Start button
- [ ] Running state: large MM:SS display, progress bar, focus status badge, warning toast, Cancel button with confirmation
- [ ] Focus detection: `visibilitychange` + `window.blur` with 500ms debounce; 1st loss → warning, 2nd loss → broken
- [ ] On complete (seconds reach 0): save `{ completed: true, reward_earned: 10 }`
- [ ] On broken/cancelled: save `{ completed: false, reward_earned: 0 }`
- [ ] Result states: completion success card, broken card, cancelled card; all with "Start New Session" button
- [ ] Commit

---

### Task 6: Dashboard page (Issue #5 display)

**Files:**
- Create: `app/(authenticated)/dashboard/page.tsx`

- [ ] Server component: fetch sessions from Supabase ordered by `created_at DESC`
- [ ] Display stats: Total Points, Completed sessions count, Total sessions count
- [ ] Session history table: date, duration, Completed/Incomplete badge, points earned
- [ ] Empty state for no sessions
- [ ] Commit
