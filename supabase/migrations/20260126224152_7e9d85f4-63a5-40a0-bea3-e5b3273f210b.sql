-- Drop existing overly permissive SELECT policies on profiles that allow anonymous access
-- We need to ensure only authenticated users can view profiles

-- First, let's drop any existing SELECT policies on profiles and recreate them properly
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new secure policies that require authentication
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles (but must be authenticated)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Also secure the user_roles table from anonymous access
-- Drop existing policies and recreate with proper authentication checks
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Recreate admin policies (these require authenticated admin status)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));