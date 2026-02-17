-- 1. Create enum for report types
CREATE TYPE public.report_type AS ENUM ('save', 'sos', 'stray', 'vaccination_wish');

-- 2. Add report_type column to dogs table
ALTER TABLE public.dogs ADD COLUMN report_type public.report_type NOT NULL DEFAULT 'stray';

-- 3. Add urgency_level for SOS reports
ALTER TABLE public.dogs ADD COLUMN urgency_level text;

-- 4. Create helper_applications table
CREATE TABLE public.helper_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Enable RLS on helper_applications
ALTER TABLE public.helper_applications ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for helper_applications
CREATE POLICY "Users can view own application"
  ON public.helper_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create application"
  ON public.helper_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
  ON public.helper_applications FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
  ON public.helper_applications FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 7. Create helper role check function
CREATE OR REPLACE FUNCTION public.is_helper(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'admin' OR role = 'moderator')
  )
  OR EXISTS (
    SELECT 1
    FROM public.helper_applications
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;

-- 8. Create is_helper_or_admin function
CREATE OR REPLACE FUNCTION public.is_helper_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin(_user_id) OR public.is_helper(_user_id)
$$;

-- 9. Drop existing dogs policies and recreate with new visibility rules
DROP POLICY IF EXISTS "Admins can delete dogs" ON public.dogs;
DROP POLICY IF EXISTS "Admins can update any dog" ON public.dogs;
DROP POLICY IF EXISTS "Admins can view all dogs" ON public.dogs;
DROP POLICY IF EXISTS "Anyone can view approved dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can report dogs" ON public.dogs;
DROP POLICY IF EXISTS "Users can update own pending dogs" ON public.dogs;
DROP POLICY IF EXISTS "Users can view own reported dogs" ON public.dogs;

-- 10. New visibility policies based on report type
-- Save: visible to everyone immediately
CREATE POLICY "Everyone can view Save reports"
  ON public.dogs FOR SELECT
  USING (report_type = 'save');

-- SOS: visible to helpers and admins only
CREATE POLICY "Helpers can view SOS reports"
  ON public.dogs FOR SELECT
  USING (report_type = 'sos' AND public.is_helper_or_admin(auth.uid()));

-- Stray/Vaccination-Wish: visible when approved OR to helpers/admins
CREATE POLICY "Approved strays visible to all"
  ON public.dogs FOR SELECT
  USING ((report_type IN ('stray', 'vaccination_wish')) AND is_approved = true);

CREATE POLICY "Helpers can view pending strays"
  ON public.dogs FOR SELECT
  USING ((report_type IN ('stray', 'vaccination_wish')) AND public.is_helper_or_admin(auth.uid()));

-- Users can always see their own reports
CREATE POLICY "Users can view own reports"
  ON public.dogs FOR SELECT
  USING (auth.uid() = reported_by);

-- Insert policy: authenticated users can report
CREATE POLICY "Authenticated users can report dogs"
  ON public.dogs FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Update policies
CREATE POLICY "Users can update own pending reports"
  ON public.dogs FOR UPDATE
  USING (auth.uid() = reported_by AND is_approved = false);

CREATE POLICY "Helpers can update any dog"
  ON public.dogs FOR UPDATE
  USING (public.is_helper_or_admin(auth.uid()));

-- Delete policy: only admins
CREATE POLICY "Only admins can delete dogs"
  ON public.dogs FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 11. Trigger for updated_at on helper_applications
CREATE TRIGGER update_helper_applications_updated_at
  BEFORE UPDATE ON public.helper_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();