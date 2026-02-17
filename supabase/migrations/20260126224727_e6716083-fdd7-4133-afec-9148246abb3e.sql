-- Fix: Restrict precise location data to authenticated users only
-- Remove policies that allow anonymous access to location data

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Approved strays visible to all" ON public.dogs;
DROP POLICY IF EXISTS "Everyone can view Save reports" ON public.dogs;

-- Create new policies that require authentication for full data access
-- Authenticated users can view approved strays and vaccination wishes
CREATE POLICY "Authenticated users can view approved strays" 
ON public.dogs 
FOR SELECT 
USING (
  (report_type = ANY (ARRAY['stray'::report_type, 'vaccination_wish'::report_type])) 
  AND (is_approved = true) 
  AND (auth.uid() IS NOT NULL)
);

-- Authenticated users can view Save reports
CREATE POLICY "Authenticated users can view Save reports" 
ON public.dogs 
FOR SELECT 
USING (
  (report_type = 'save'::report_type) 
  AND (auth.uid() IS NOT NULL)
);