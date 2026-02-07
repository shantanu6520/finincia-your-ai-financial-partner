-- Strengthen RLS policies on profiles table

-- Drop existing policies to recreate them with explicit role specifications
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with explicit role targeting (TO authenticated)
-- This ensures anonymous users cannot access the table

-- SELECT: Only authenticated users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Only authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Only authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicit denial for anonymous users
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR ALL
TO anon
USING (false)
WITH CHECK (false);