# Security Review

## Checklist

### API Key & Secret Management
- [x] `.env.local` is listed in `.gitignore` — real credentials are never committed
- [x] `.env.example` contains only placeholder values, safe to commit
- [x] No API keys or secrets found in git history (`git log -S "supabase" -- .env*` returns nothing)
- [x] Only the Supabase **anon (public)** key is used in frontend code — the service role key is never used client-side

### Supabase Row Level Security (RLS)
- [x] RLS is enabled on the `sessions` table
- [x] Users can only read their own sessions (`auth.uid() = user_id`)
- [x] Users can only insert their own sessions (`auth.uid() = user_id`)
- [x] No policy allows cross-user data access

### Authentication
- [x] Middleware protects `/timer` and `/dashboard` — unauthenticated users are redirected to `/login`
- [x] Middleware gracefully handles missing env vars instead of crashing (fixed in PR #13)
- [x] Auth is handled by Supabase Auth — no custom password storage

### Environment Variables on Vercel
- [x] Production env vars are configured directly in Vercel dashboard, not in the repository
- [x] Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel

## What `NEXT_PUBLIC_` means

Variables prefixed with `NEXT_PUBLIC_` are intentionally exposed to the browser. The Supabase **anon key** is designed to be public — it identifies the project but access is controlled by RLS policies on the database side. This is Supabase's intended usage pattern.

The **service role key** (which bypasses RLS) is never used in this project and must never be added to frontend code or committed to the repository.
