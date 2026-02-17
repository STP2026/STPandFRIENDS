-- Create advertisements table for partner ads
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_delay_seconds INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Everyone can view active ads (for the popup)
CREATE POLICY "Anyone can view active advertisements"
ON public.advertisements
FOR SELECT
USING (is_active = true);

-- Admins can view all ads
CREATE POLICY "Admins can view all advertisements"
ON public.advertisements
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert ads
CREATE POLICY "Admins can insert advertisements"
ON public.advertisements
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update ads
CREATE POLICY "Admins can update advertisements"
ON public.advertisements
FOR UPDATE
USING (is_admin(auth.uid()));

-- Only admins can delete ads
CREATE POLICY "Admins can delete advertisements"
ON public.advertisements
FOR DELETE
USING (is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();