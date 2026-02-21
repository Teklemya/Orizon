# Authentication Flow Diagram

Visual guide to how authentication works in Orizon.

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    USER OPENS APP                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  App.tsx checks: Is user logged in?                             │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   YES - Has session  │    │   NO - No session    │          │
│  └──────────────────────┘    └──────────────────────┘          │
│            ↓                           ↓                        │
│      Show Dashboard            Redirect to /login              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Login Page - User chooses authentication method:               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  [  Continue with Google  ]                                ││
│  │                                                            ││
│  │  ─────────────── Or continue with email ───────────────   ││
│  │                                                            ││
│  │  Email:    [________________]                             ││
│  │  Password: [________________]                             ││
│  │                                                            ││
│  │  [x] Forgot password?                                     ││
│  │                                                            ││
│  │  [    Log In    ]     Need an account? →                  ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          ↓                    ↓                      ↓
    ┌─────────┐         ┌──────────┐         ┌──────────────┐
    │ Google  │         │  Email/  │         │    Forgot    │
    │  OAuth  │         │ Password │         │   Password   │
    └─────────┘         └──────────┘         └──────────────┘
          ↓                    ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SUPABASE AUTH (Backend)                                        │
│                                                                 │
│  1. Validates credentials                                       │
│  2. Creates/retrieves user from auth.users                      │
│  3. Generates JWT token                                         │
│  4. Returns session                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  DATABASE TRIGGER (if new user)                                 │
│                                                                 │
│  handle_new_user() → Creates profile in public.profiles         │
│                                                                 │
│  INSERT INTO profiles (id, email, display_name)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Auth Context Updates                                           │
│                                                                 │
│  - Stores session in localStorage                               │
│  - Updates React state: user = { id, email, displayName }       │
│  - Triggers re-render                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ProtectedRoute Component Checks Session                        │
│                                                                 │
│  Session exists? → Allow access to Dashboard                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  USER SEES DASHBOARD                                            │
│                                                                 │
│  Header shows: [Logout] button                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Management

### Token Lifecycle

```
[User logs in]
      ↓
[Supabase returns JWT token + refresh token]
      ↓
[Token stored in localStorage]
      ↓
[Token valid for 1 hour]
      ↓
[Before expiry: Auto-refresh triggered]
      ↓
[New token retrieved without user action]
      ↓
[Session continues seamlessly]
```

### What Happens on Page Refresh?

```
[User refreshes browser]
      ↓
[Auth Context reads from localStorage]
      ↓
[Validates session with Supabase]
      ↓
[Session still valid?]
   ↓             ↓
 YES            NO
   ↓             ↓
Stay logged   Redirect to
  in          login page
```

---

## Sign Out Flow

```
[User clicks Logout button]
      ↓
[signOut() called]
      ↓
[Supabase invalidates session]
      ↓
[localStorage cleared]
      ↓
[Auth context updates: user = null]
      ↓
[App re-renders]
      ↓
[ProtectedRoute sees no user]
      ↓
[Redirects to /login]
```

---

## Protected Route Logic

```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

---

## Database Relationships

```
┌─────────────────────────────────────────┐
│  auth.users (Supabase managed)          │
│  ─────────────────────────────────────  │
│  id: 123e4567-e89b-...                  │
│  email: user@example.com                │
│  encrypted_password: $2b$...            │
│  provider: email                        │
└─────────────────────────────────────────┘
              ↓ (Foreign Key)
┌─────────────────────────────────────────┐
│  public.profiles (Your app data)        │
│  ─────────────────────────────────────  │
│  id: 123e4567-e89b-... (FK)             │
│  email: user@example.com                │
│  display_name: John Doe                 │
│  avatar_url: https://...                │
│  created_at: 2026-02-10                 │
└─────────────────────────────────────────┘
```

---

## Password Reset Flow

```
[User clicks "Forgot password?"]
      ↓
[Enters email address]
      ↓
[resetPassword(email) called]
      ↓
[Supabase sends email with secure token]
      ↓
[User clicks link in email]
      ↓
[Redirected to /reset-password with token in URL]
      ↓
[ResetPassword page detects token]
      ↓
[User enters new password]
      ↓
[Supabase updates password]
      ↓
[User auto-logged in]
      ↓
[Redirected to dashboard]
```

---

## Google OAuth Flow

```
[User clicks "Continue with Google"]
      ↓
[signInWithGoogle() called]
      ↓
[Supabase redirects to Google login]
      ↓
[User logs in with Google]
      ↓
[Google asks: "Allow Orizon to access your email?"]
      ↓
[User clicks "Allow"]
      ↓
[Google redirects back to app with auth code]
      ↓
[Supabase exchanges code for tokens]
      ↓
[Creates/retrieves user in auth.users (provider: google)]
      ↓
[Trigger creates profile in public.profiles]
      ↓
[User logged in automatically]
      ↓
[Redirected to dashboard]
```

---

## Security Layers

```
┌───────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Route Guards (ProtectedRoute)          │
│  - Checks if user exists in React state                   │
│  - Redirects unauthenticated users to /login              │
└───────────────────────────────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────────┐
│  Layer 2: JWT Token Validation (Supabase Client)          │
│  - Every API request includes JWT token                   │
│  - Supabase validates signature and expiry                │
└───────────────────────────────────────────────────────────┘
                        ↓
┌───────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (Database)                   │
│  - Policies check auth.uid() matches row owner            │
│  - Users can only read/write their own data               │
└───────────────────────────────────────────────────────────┘
```

---

## Auth State in React

```typescript
// Auth Context State
{
  user: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "user@example.com",
    displayName: "John Doe"
  } | null,
  loading: boolean
}

// Available Methods
{
  signUp: (email, password) => Promise<{error?, needsConfirmation?}>
  signIn: (email, password) => Promise<{error?}>
  signInWithGoogle: () => Promise<{error?}>
  signOut: () => Promise<void>
  resetPassword: (email) => Promise<{error?, success?}>
}
```

---

**Last Updated**: February 10, 2026
