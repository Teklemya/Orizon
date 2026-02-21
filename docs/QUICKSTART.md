# Quick Start: Supabase Auth

Get Orizon authentication running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd apps/web
pnpm add @supabase/supabase-js
```

## Step 2: Run Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New Query
3. Copy & paste from: `apps/api/migrations/001_create_profiles.sql`
4. Click **Run**

## Step 3: Start the App

```bash
cd apps/web
pnpm dev
```

Visit http://localhost:5173

## Step 4: Test

1. Click "Need an account?"
2. Enter email + password
3. Create account
4. You're logged in

---

## Features Implemented

- Email/Password sign up & login
- Google OAuth (needs config in Supabase)
- Password reset
- Protected routes
- Session persistence
- Auto-profile creation

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/.env` | Your Supabase credentials |
| `apps/web/src/lib/auth.tsx` | Auth context & hooks |
| `apps/web/src/pages/Login.tsx` | Login/signup UI |
| `apps/api/migrations/001_create_profiles.sql` | Database setup |

---

## Environment Variables

Located in `apps/web/.env`:

```env
VITE_SUPABASE_URL=https://hcfkhrrhkjidacrkfihi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Note:** Never commit this file to git (already in `.gitignore`)

---

## Troubleshooting

**"Missing Supabase environment variables"**
→ Restart dev server: `pnpm dev`

**Can't log in**
→ Check Supabase dashboard → Authentication → Users

**Profile not created**
→ Re-run the SQL migration

---

## More Info

- **Full Guide**: `SUPABASE_AUTH_SETUP.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth

---

**Last Updated**: Feb 10, 2026
