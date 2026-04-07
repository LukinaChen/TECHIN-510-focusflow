# Architecture Document — FocusFlow

## Overview

FocusFlow is a web-based classroom focus timer that helps students stay on task during lectures. Users start a timed focus session, and if they complete it without switching tabs or navigating away, they earn points as a reward. Over time, streaks and accumulated rewards reinforce better attention habits.

---

## Data Model

The application uses two tables in a PostgreSQL database managed by Supabase.

### Table: `users` (managed by Supabase Auth)

| Column     | Type        | Description                    |
|------------|-------------|--------------------------------|
| id         | UUID (PK)   | Auto-generated user ID         |
| email      | TEXT        | User email (from Supabase Auth)|
| created_at | TIMESTAMPTZ | Account creation timestamp     |

> Supabase Auth handles user creation automatically. No additional user-profile table is needed for MVP.

### Table: `sessions`

| Column           | Type        | Description                                      |
|------------------|-------------|--------------------------------------------------|
| id               | UUID (PK)   | Auto-generated session ID                        |
| user_id          | UUID (FK)   | References `users.id`                            |
| duration_minutes | INTEGER     | Planned session length in minutes                |
| started_at       | TIMESTAMPTZ | When the session began                           |
| completed        | BOOLEAN     | Whether the user completed without leaving       |
| reward_earned    | INTEGER     | Points awarded (0 if not completed)              |
| created_at       | TIMESTAMPTZ | Auto-generated row creation timestamp            |

### Relationships

- One user → many sessions (`users.id` ← `sessions.user_id`)

### Why only 2 tables?

The must-have feature is simple: start a timer, complete it, get a reward. Points can be aggregated from session records via a `SUM(reward_earned)` query, and streaks can be derived by checking consecutive completed sessions by date. This avoids redundant state and keeps the schema minimal.

---

## Reward Logic

| Condition | Points |
|-----------|--------|
| Complete a session without leaving the page | **+10 points** (base) |
| Streak bonus (stretch goal) | **+5 points** per consecutive completed session |

Rewards are displayed as a point total on the Dashboard. Badges and animated reveals (confetti, unlock effects) are stretch goals.

---

## Tab-Away / Focus Detection Strategy

The core mechanic of FocusFlow depends on detecting when a user leaves the app during a session. The implementation uses two browser APIs:

- **`document.addEventListener('visibilitychange', ...)`** — fires when the user switches tabs or minimizes the browser.
- **`window.addEventListener('blur', ...)`** — fires when the window loses focus (e.g., switching to another app).

### Behavior on focus loss:

| Event | Action |
|-------|--------|
| **1st offense** | Show a warning toast: "Focus lost! Try to stay on the page." Session continues. |
| **2nd offense or intentional navigation** | Mark session as broken (`completed: false`), stop the timer. |
| **Configurable grace window** | Allow 1 accidental tab-away before penalizing. |

This approach balances strictness with usability — accidental Command-Tab or notification pop-ups won't immediately ruin a session.

---

## Tech Stack Justification

| Layer        | Choice                    | Rationale |
|--------------|---------------------------|-----------|
| Frontend     | **Next.js (App Router)**  | Component-based UI for building the timer, reward screen, and dashboard. App Router provides clean routing and layout nesting. |
| Backend/API  | **Next.js API Routes**    | Co-located with the frontend — no separate server. Simple endpoints for session CRUD. |
| Database     | **Supabase (PostgreSQL)** | Managed Postgres with built-in Auth, Row Level Security, and a generous free tier. Eliminates custom auth work. |
| Auth         | **Supabase Auth**         | Email/password or magic link login out of the box. Integrates with RLS policies to secure per-user data. |
| Hosting      | **Vercel**                | Zero-config deployment for Next.js. Automatic preview deploys on every PR for client review. |
| Styling      | **Tailwind CSS**          | Utility-first CSS for rapid UI development. |

### Why Next.js + Supabase over Streamlit?

- **User experience**: This is a student-facing tool that needs to feel like a polished app, not a data dashboard. Next.js supports smooth timer animations, reward celebrations, and responsive mobile layouts.
- **Page Visibility API**: The browser's Visibility API is critical for detecting tab-away — Streamlit does not expose this.
- **Deployment cost**: Vercel + Supabase free tiers mean zero hosting cost during development.

---

## Agentic Engineering Plan

### AI Tools

| Tool       | Usage |
|------------|-------|
| **Claude** | Architecture planning, generating boilerplate, debugging, writing tests, drafting documentation. |
| **Cursor** | In-editor AI-assisted coding — auto-completing React components, refactoring, and inline code generation with Claude as the backend model. |

### Development Workflow with AI

1. **Scaffolding** — Use Claude to generate the Next.js project structure, Supabase schema migration SQL, and auth configuration.
2. **Component development** — Use Cursor to rapidly build React components (Timer, Reward Screen, Dashboard) with inline AI suggestions.
3. **Focus detection** — Use Claude to draft and test the `visibilitychange` / `blur` event handling logic with the grace-window behavior.
4. **API routes** — Use Claude to generate session CRUD endpoints and reward calculation logic.
5. **Testing** — Use Claude to generate unit tests for reward logic and integration tests for the session lifecycle.
6. **Code review prep** — Before each PR, use Claude to review diffs for bugs, security issues, and consistency.

### Estimated AI Contribution

Approximately 60–70% of boilerplate and repetitive code will be AI-generated, with manual review and adjustment for all critical logic (timer accuracy, focus detection edge cases, reward calculation).

---

## Application Architecture

```
┌─────────────────────────────────────────────┐
│              Client (Browser)               │
│  ┌────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Home/Timer │ │  Reward  │ │ Dashboard │ │
│  └─────┬──────┘ └────┬─────┘ └─────┬─────┘ │
│        │              │             │       │
│        ▼              ▼             ▼       │
│  Page Visibility API      Supabase Auth     │
│  Window blur/focus                          │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────┐
│        Next.js API Routes (Vercel)          │
│  POST /api/sessions/start                   │
│  POST /api/sessions/end                     │
│  GET  /api/sessions/history                 │
│  GET  /api/users/stats                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        Supabase (PostgreSQL + Auth)         │
│  ┌──────────┐    ┌──────────────────┐       │
│  │  users   │───▶│    sessions      │       │
│  └──────────┘    └──────────────────┘       │
└─────────────────────────────────────────────┘
```

---

## Key Pages / Views

1. **Home / Timer** — Main page: duration selector, start button, live countdown, and focus-detection logic with warning toasts.
2. **Reward / Completion Screen** — Shown after a successful session: points earned, encouraging message, option to start another session.
3. **Dashboard / History** — Lists past sessions (date, duration, completed/broken), total accumulated points, and streak info.

---

## Developer

- **Developer**: Lukina Chen
- **Agreed Fee**: 40 GIX Bucks
