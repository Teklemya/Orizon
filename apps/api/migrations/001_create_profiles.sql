-- =====================================================
-- SUPABASE AUTH SETUP: User Profiles Table
-- =====================================================
-- This migration creates a profiles table that syncs with Supabase Auth.
-- When a user signs up, their profile is automatically created via trigger.
--
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =====================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: Run handle_new_user() after each signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Index for faster email lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =====================================================
-- VERIFICATION QUERIES (optional - run to check setup)
-- =====================================================
-- Check if table exists:
-- SELECT * FROM public.profiles;
--
-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- Test trigger (after you sign up a user):
-- SELECT * FROM public.profiles WHERE email = 'test@example.com';
