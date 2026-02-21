# Supabase Authentication Setup Guide

This guide walks you through setting up the complete Supabase Auth system for Orizon.

## Overview

Production-ready Supabase Authentication with:

- Email + Password sign up & login
- Google OAuth (Sign in with Google)
- Password reset (Forgot password)
- Session management (auto-refresh, persistence)
- Protected routes (redirect to /login if not authenticated)
- User profiles table (auto-created on signup)
- Row Level Security (RLS) policies

---

## Quick Start

### 1. Install Dependencies

```bash
cd apps/web
pnpm add @supabase/supabase-js
```

### 2. Run Database Migration

Go to your Supabase dashboard and run the SQL migration:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hcfkhrrhkjidacrkfihi`
3. Go to **SQL Editor** → **New Query**
4. Copy the contents of `apps/api/migrations/001_create_profiles.sql`
5. Paste and click **Run**

This creates:
- `profiles` table
- RLS policies
- Auto-create profile trigger

### 3. Configure Google OAuth (Optional)

To enable "Sign in with Google":

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Google** provider
3. Follow the setup wizard to get OAuth credentials from Google Cloud Console
4. Add authorized redirect URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

### 4. Start the App

```bash
# Start backend API (if needed)
cd apps/api
pnpm dev

# Start frontend
cd apps/web
pnpm dev
```

Visit http://localhost:5173 and you should be redirected to /login

---

## Files Changed/Created

### New Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/supabase.ts` | Supabase client initialization |
| `apps/web/src/components/ProtectedRoute.tsx` | Route guard component |
| `apps/web/src/pages/ResetPassword.tsx` | Password reset page |
| `apps/web/.env` | Environment variables (Supabase credentials) |
| `apps/web/.env.example` | Example env file for other developers |
| `apps/api/migrations/001_create_profiles.sql` | Database schema migration |

### Updated Files

| File | Changes |
|------|---------|
| `apps/web/src/lib/auth.tsx` | Replaced demo auth with real Supabase Auth |
| `apps/web/src/pages/Login.tsx` | Added signup, Google OAuth, forgot password |
| `apps/web/src/App.tsx` | Added protected routes wrapper |
| `apps/web/src/layout/Layout.tsx` | Updated logout to use Supabase signOut |
| `apps/web/.gitignore` | Added .env to ignore list |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React)                                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  Login Page                                  │  │
│  │  - Email/Password forms                      │  │
│  │  - Google OAuth button                       │  │
│  │  - Forgot password link                      │  │
│  └─────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐  │
│  │  Auth Context (useAuth hook)                │  │
│  │  - signUp(email, password)                   │  │
│  │  - signIn(email, password)                   │  │
│  │  - signInWithGoogle()                        │  │
│  │  - signOut()                                 │  │
│  │  - resetPassword(email)                      │  │
│  └─────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐  │
│  │  Supabase Client                             │  │
│  │  - Session management                        │  │
│  │  - Token auto-refresh                        │  │
│  │  - localStorage persistence                  │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  SUPABASE (Backend as a Service)                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  auth.users (managed by Supabase)           │  │
│  │  - User credentials                          │  │
│  │  - Email verification status                 │  │
│  │  - OAuth provider links                      │  │
│  └─────────────────────────────────────────────┘  │
│                      ↓ (trigger)                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  public.profiles (your app data)            │  │
│  │  - id, email, display_name                   │  │
│  │  - Auto-created on signup                    │  │
│  │  - Protected by RLS policies                 │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Security Features

### Row Level Security (RLS)

All profiles are protected by RLS policies:

- **Read**: Anyone can view profiles (useful for user listings)
- **Update**: Users can only update their own profile
- **Delete**: Cascades from auth.users (when user account is deleted)

### Token Management

- Tokens auto-refresh before expiry
- Sessions persist in localStorage (secure HttpOnly cookies in production)
- Anon key used in frontend (limited permissions)
- Service role key stays in backend only (admin access)

### Password Requirements

- Minimum 6 characters
- Hashed with bcrypt by Supabase
- Never stored in plain text

---

## User Experience

### Login Flow

1. User visits any protected route (e.g., `/dashboard`)
2. `ProtectedRoute` checks session
3. If no session → redirect to `/login`
4. User enters credentials
5. On success → redirect to original destination
6. Session persists across browser tabs

### Signup Flow

1. User clicks "Need an account?" on login page
2. Enters email + password (with confirmation)
3. Clicks "Create Account"
4. **If email confirmation enabled:**
   - Shows "Check your email" message
   - User clicks link in email
   - Returns to app → auto-logged in
5. **If email confirmation disabled:**
   - Auto-logged in immediately
   - Redirected to dashboard

### Google OAuth Flow

1. User clicks "Continue with Google"
2. Redirected to Google login page
3. Grants permissions
4. Redirected back to app
5. Profile auto-created
6. Logged in and redirected to dashboard

### Password Reset Flow

1. User clicks "Forgot password?" on login
2. Enters email
3. Receives email with reset link
4. Clicks link → taken to `/reset-password`
5. Enters new password
6. Redirected to dashboard (logged in)

---

## Testing the Implementation

### Test Email/Password Signup

1. Go to http://localhost:5173/login
2. Click "Need an account?"
3. Enter email: `test@example.com`
4. Enter password: `test123`
5. Click "Create Account"
6. Check Supabase dashboard → **Authentication** → **Users**
7. Verify new user exists

### Test Login

1. Sign out (click Logout in header)
2. Go to /login
3. Enter the credentials you just created
4. Click "Log In"
5. Should redirect to /dashboard

### Test Protected Routes

1. Sign out
2. Try to visit http://localhost:5173/dashboard directly
3. Should redirect to /login
4. After login, should return to /dashboard

### Test Google OAuth

1. Click "Continue with Google"
2. Complete Google login
3. Check Supabase dashboard → user should have `provider: google`

### Verify Database

```sql
-- Check profiles table
SELECT * FROM public.profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check auth users
SELECT * FROM auth.users;
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Check that `apps/web/.env` exists
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server (`pnpm dev`)

### "Invalid login credentials"

- Check that the user exists in Supabase → Authentication → Users
- Verify email is confirmed (if email confirmation is enabled)
- Try resetting password

### Google OAuth not working

- Verify Google provider is enabled in Supabase dashboard
- Check authorized redirect URLs include your domain
- Make sure OAuth credentials are correctly configured

### Profile not created on signup

- Check that the SQL migration was run successfully
- Verify the trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Check Supabase logs for errors

### Session not persisting

- Check browser localStorage (DevTools → Application → Local Storage)
- Look for keys starting with `sb-`
- Clear localStorage and try logging in again

---

## Environment Variables Reference

### Required Variables (apps/web/.env)

```env
VITE_SUPABASE_URL=https://hcfkhrrhkjidacrkfihi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Where to Find

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** → `VITE_SUPABASE_URL`
5. Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**Note:** Never commit `.env` to git (already in `.gitignore`)

---

## Email Confirmation Settings

By default, Supabase requires email confirmation. To change:

1. Go to **Authentication** → **Settings**
2. Find **Email Confirmations**
3. Toggle **Enable email confirmations**
4. Save

**With confirmation enabled:**
- User receives email after signup
- Must click link to confirm account
- Can't log in until confirmed

**With confirmation disabled:**
- User auto-logged in after signup
- No email sent
- Faster onboarding (but less secure)

---

## Next Steps

### Add Profile Fields

Edit the migration to add more fields to profiles:

```sql
ALTER TABLE public.profiles
ADD COLUMN full_name TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN bio TEXT;
```

### Add Social Links

Store multiple OAuth providers:

```sql
-- Users can link multiple providers (Google, GitHub, etc.)
-- This is already handled by Supabase auth.identities table
```

### Add Roles/Permissions

```sql
ALTER TABLE public.profiles
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update RLS policies to check roles
```

### Email Templates

Customize auth emails in Supabase dashboard:
- **Authentication** → **Email Templates**
- Edit confirmation, password reset, magic link templates

---

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## Implementation Checklist

- [x] Install @supabase/supabase-js
- [x] Create Supabase client setup
- [x] Create profiles table migration
- [x] Update auth context with Supabase methods
- [x] Upgrade login page with signup + OAuth
- [x] Add protected route component
- [x] Add password reset page
- [x] Configure environment variables
- [x] Update .gitignore for .env
- [ ] Run database migration in Supabase
- [ ] Enable Google OAuth (optional)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test Google OAuth (if enabled)
- [ ] Test password reset
- [ ] Test protected routes

---

**Last Updated:** February 10, 2026
