# SPEC.md — FocusFlow: Classroom Focus Timer with Rewards

## Project Overview

**Project Name:** FocusFlow  
**Developer:** *Lukina Chen*  
**Product Owner:** Veronika Sermeno Pon  
**Agreed Development Fee:** *40* GIX Bucks  
**Stack:** Next.js + Supabase  

---

## Problem Statement

Students frequently get distracted by their phones or laptops during class, switching to unrelated apps during lectures. This reduces their focus, negatively impacts learning outcomes, and diminishes the presenter's effectiveness. FocusFlow addresses this with a simple, browser-based focus timer that rewards students for staying on task.

---

## Must-Have Feature (MVP Definition)

> Users can start a timed focus session and receive a reward after completing it without leaving the app.

---

## User Stories

### Core Focus Flow

**US-01 — Start a Focus Session**
As a student, I want to set a focus duration and start a timer, so that I have a structured period to stay focused during class.

*Acceptance Criteria:*
- User can select or input a duration (e.g., 25 min, 50 min, custom)
- A countdown timer starts and is clearly visible
- The session is tied to the user's account

**US-02 — Stay-on-Page Detection**
As a student, I want the app to detect if I leave or tab away, so that my focus session is invalidated if I switch apps or windows.

*Acceptance Criteria:*
- Browser `visibilitychange` and `blur` events are monitored
- If user leaves the page, the session is marked as broken
- A warning is shown if focus is lost; session can optionally auto-cancel

**US-03 — Complete a Session and Receive a Reward**
As a student, I want to receive a small reward when I complete a focus session without leaving, so that I feel motivated to stay focused.

*Acceptance Criteria:*
- Upon timer completion with no tab-away events, a reward is granted
- Reward is displayed visually (e.g., badge, points, motivational message)
- Reward is stored and visible in the user's profile/history

**US-04 — View Focus History and Rewards**
As a student, I want to see my completed sessions and earned rewards, so that I can track my progress over time.

*Acceptance Criteria:*
- A history page lists past sessions (date, duration, status: completed/broken)
- Total rewards/points are shown on a profile or dashboard

### Authentication

**US-05 — Sign Up and Log In**
As a user, I want to create an account and log in, so that my sessions and rewards are saved to my profile.

*Acceptance Criteria:*
- Email/password or magic link authentication via Supabase Auth
- Session data is persisted per authenticated user

---

## Desired Specifications

### Pages / Views (2–3 required)

| View | Description |
|------|-------------|
| **Home / Timer** | Main focus session page: duration selector, start button, live countdown, and leave-detection logic |
| **Reward / Completion** | Shown after a successful session: reward display, encouraging message, option to start another session |
| **Dashboard / History** | Shows session history, streak info, and total accumulated rewards |

### Data Model

**Table 1: `users`** *(managed by Supabase Auth)*
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | text | Auth email |
| created_at | timestamp | Auto |

**Table 2: `sessions`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → users |
| duration_minutes | integer | Planned duration |
| started_at | timestamp | Session start time |
| completed | boolean | True if finished without leaving |
| reward_earned | integer | Points/stars earned (0 if not completed) |
| created_at | timestamp | Auto |

### Reward Logic

- Completing a session without leaving: **+10 points** (base)
- Streak bonuses (optional stretch): +5 points per consecutive completed session
- Rewards are displayed as a point total and optionally as badges

### Tab-Away / Focus Detection

- Use `document.addEventListener('visibilitychange', ...)` and `window.addEventListener('blur', ...)`
- First offense: show a warning toast ("Focus lost! Try to stay on the page.")
- Second offense or intentional navigation: mark session as broken, stop timer
- Configurable grace window (e.g., allow 1 accidental tab-away)

---

## Out of Scope (v1)

- Mobile native app
- Instructor-facing dashboard or class management
- AI features
- Social/leaderboard features
- Integration with LMS (Canvas, Blackboard, etc.)
- Push notifications

---

## Stretch Goals (post-MVP)

- Streak tracking and streak-based bonus rewards
- Animated reward reveals (confetti, badge unlock)
- Custom reward themes
- Class session codes (instructor shares a code, students join a shared focus session)
- AI-generated motivational messages on completion

---

## Technical Notes

- **Framework:** Next.js (App Router preferred)
- **Backend/DB:** Supabase (Auth + Postgres)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Key browser APIs:** `Page Visibility API`, `Window blur/focus events`

---

## Definition of Done

A feature is considered done when:
1. It is implemented and functional in the deployed environment
2. It handles the described acceptance criteria
3. It has been reviewed and approved by the product owner
